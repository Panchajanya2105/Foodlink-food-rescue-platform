# Foodlink – Database Architecture & Entity Specifications (Phase 2)

## 1. Overview
Foodlink utilizes MongoDB with Mongoose for persistent data modeling. The database layer uses strict ObjectId references, validation rules, geospatial indexes (`2dsphere`), and multi-document atomic operations.

---

## 2. Entity Schemas & Relationships

### 1. `User`
Primary authentication and account identity entity.
- `name` (String, required, max 100)
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, min 6, select: false, bcrypt hashed)
- `phone` (String, required)
- `role` (Enum: `donor`, `ngo`, `delivery`, `admin`)
- `accountStatus` (Enum: `pending`, `verified`, `rejected`, `suspended`)
- `verificationStatus` (Enum: `pending`, `verified`, `rejected`)
- `isVerified` (Boolean, default: false)
- `profileComplete` (Boolean, default: false)
- **Indexes**: `{ role: 1, accountStatus: 1 }`, `{ email: 1 }` (unique)
- **Methods**: `comparePassword(candidatePassword)`

### 2. `NGOProfile`
Stores community shelter operational parameters.
- `user` (ObjectId -> `User`, unique, required)
- `organizationName` (String, required)
- `registrationNumber` (String, required, tax-exempt / 501(c)(3) ID)
- `organizationType` (Enum: `shelter`, `soup_kitchen`, `food_bank`, `community_center`, `charity`)
- `contactPerson`, `phone`, `email`
- `address` (`street`, `city`, `state`, `postalCode`, `country`)
- `location` (`Point`, coordinates: `[longitude, latitude]`)
- `foodCategoriesAccepted` (Array of `FOOD_CATEGORIES`)
- `capacity` (Number, daily meals / intake capacity)
- `storageCapabilities` (`hasRefrigeration`, `hasFreezer`, `hasHotHolding`, `storageSquareFootage`)
- `operatingHours` (`openTime`, `closeTime`, `daysActive`)
- `verificationStatus` (`pending`, `verified`, `rejected`)
- **Indexes**: `location: '2dsphere'`, `verificationStatus: 1`, `capacity: 1`

### 3. `DeliveryProfile`
Stores volunteer courier and fleet vehicle capabilities.
- `user` (ObjectId -> `User`, unique, required)
- `vehicleType` (Enum: `bicycle`, `motorcycle`, `car`, `van`, `insulated_truck`, `foot`)
- `vehiclePlate` (String)
- `thermalEquipment` (`hasInsulatedBox`, `hasCoolingPack`, `hasHotHoldingContainer`, `maxCapacityKg`)
- `serviceArea` (`city`, `radiusKm`, `currentCoordinates`)
- `availabilityStatus` (Enum: `available`, `busy`, `offline`)
- `accountStatus` (Enum: `pending`, `verified`, `suspended`)
- `totalCompletedDeliveries` (Number, default 0)
- `rating` (Number, 1.0 to 5.0, default 5.0)
- **Indexes**: `{ availabilityStatus: 1, accountStatus: 1 }`, `{ 'serviceArea.city': 1 }`

### 4. `Donation`
Core surplus food listing record.
- `donor` (ObjectId -> `User`, required)
- `foodName` (String, required, max 150)
- `description` (String, max 1000)
- `category` (Enum: `cooked_meals`, `bakery`, `produce`, `dairy`, `packaged`, `beverages`, `other`)
- `quantity` (Number, min 1)
- `unit` (Enum: `meals`, `portions`, `kg`, `boxes`, `trays`, `litres`, `packages`)
- `preparationDate` (Date, required)
- `expiryDate` (Date, required)
- `pickupDeadline` (Date, required, <= expiryDate)
- `storageRequirement` (Enum: `ambient`, `refrigerated`, `frozen`, `hot_holding`)
- `currentTemperatureCelsius` (Number)
- `packagingType` (String)
- `allergens` (Array: `gluten`, `dairy`, `nuts`, `peanuts`, `eggs`, `soy`, `fish`, `shellfish`, `sesame`, `none`)
- `dietaryFlags` (`isVegetarian`, `isVegan`, `isHalal`, `isGlutenFree`)
- `pickupAddress` (`street`, `city`, `state`, `postalCode`)
- `location` (`Point`, coordinates: `[lng, lat]`)
- `status` (Enum: `draft`, `available`, `requested`, `matched`, `assigned`, `picked_up`, `delivered`, `cancelled`, `expired`)
- `safetyChecklist` (ObjectId -> `FoodSafetyChecklist`)
- `recipientNGO` (ObjectId -> `User`)
- **Indexes**: `status: 1`, `donor: 1`, `location: '2dsphere'`, `pickupDeadline: 1`, `expiryDate: 1`

### 5. `FoodSafetyChecklist`
Mandatory verification form submitted by food donors.
- `donation` (ObjectId -> `Donation`, unique, required)
- `donor` (ObjectId -> `User`, required)
- `commercialKitchenPrepared` (Boolean)
- `noConsumerBuffetContact` (Boolean)
- `sealedSanitizedPackaging` (Boolean)
- `labeledWithPreparationTime` (Boolean)
- `temperatureCompliantAtPacking` (Boolean)
- `recordedTemperatureCelsius` (Number)
- `allergensAccuratelyDeclared` (Boolean)
- `donorConfirmation` (Boolean, required true)
- `donorDeclarationName` (String)
- `passedAllChecks` (Boolean, automatically evaluated on validation)
- `notes` (String)
- `completedAt` (Date)

### 6. `DonationRequest`
Request submitted by an NGO to claim portions of a donation.
- `donation` (ObjectId -> `Donation`, required)
- `ngo` (ObjectId -> `User`, required)
- `requestedQuantity` (Number, min 1)
- `status` (Enum: `pending`, `approved`, `rejected`, `cancelled`)
- `deliveryPreference` (Enum: `volunteer_delivery`, `self_pickup`)
- `intakeReason` (String)
- `beneficiariesCount` (Number)
- `donorDecision` (`decision`, `decidedAt`, `decidedBy`)
- `rejectionReason` (String)
- **Indexes**: `{ donation: 1, ngo: 1 }`, `status: 1`

### 7. `DeliveryAssignment`
Delivery task connecting donor, courier volunteer, and recipient shelter.
- `donation` (ObjectId -> `Donation`, required)
- `request` (ObjectId -> `DonationRequest`)
- `deliveryPartner` (ObjectId -> `User`, required)
- `pickupLocation` (`address`, `city`, `coordinates`)
- `destination` (`address`, `city`, `ngoName`, `coordinates`)
- `status` (Enum: `pending`, `accepted`, `in_transit`, `completed`, `cancelled`, `failed`)
- `pickupConfirmation` (`isConfirmed`, `confirmedAt`, `temperatureCelsius`, `sealIntact`, `donorSignoffName`)
- `deliveryConfirmation` (`isConfirmed`, `confirmedAt`, `temperatureCelsius`, `packagingIntact`, `ngoReceiverName`)
- **Indexes**: `donation: 1`, `{ deliveryPartner: 1, status: 1 }`, `status: 1`

### 8. `Feedback`
Mutual rating and review recorded after food receipt.
- `donation` (ObjectId -> `Donation`, required)
- `submittedBy` (ObjectId -> `User`, required)
- `recipient` (ObjectId -> `User`, required)
- `feedbackType` (Enum: `donor_to_ngo`, `ngo_to_donor`, `ngo_to_delivery`, `delivery_to_donor`, `general`)
- `rating` (Number, 1 to 5)
- `foodQualityRating` (Number, 1 to 5)
- `punctualityRating` (Number, 1 to 5)
- `comment` (String, max 1000)
- **Indexes**: `donation: 1`, `recipient: 1`

### 9. `Notification`
In-app notification system supporting periodic polling.
- `recipient` (ObjectId -> `User`, required)
- `notificationType` (Enum: `donation_posted`, `match_found`, `request_received`, `request_approved`, `request_rejected`, `delivery_assigned`, `picked_up`, `delivered`, `safety_alert`, `verification_update`, `system`)
- `title` (String)
- `message` (String)
- `isRead` (Boolean, default false)
- `readAt` (Date)
- `relatedResource` (`resourceType`, `resourceId`)
- **Indexes**: `{ recipient: 1, isRead: 1 }`, `{ createdAt: -1 }`

### 10. `StatusHistory`
Immutable audit log for all status transitions across a donation's lifecycle.
- `donation` (ObjectId -> `Donation`, required)
- `previousStatus` (String)
- `newStatus` (String, required)
- `actor` (ObjectId -> `User`, required)
- `actionName` (String)
- `reason` (String)
- `createdAt` (Timestamp)
- **Indexes**: `{ donation: 1, createdAt: -1 }`

