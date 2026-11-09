export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  // Sorting: e.g. sort=-createdAt or sort=quantity:asc
  let sort = { createdAt: -1 };
  if (query.sort) {
    if (query.sort.startsWith('-')) {
      sort = { [query.sort.substring(1)]: -1 };
    } else {
      sort = { [query.sort]: 1 };
    }
  }

  return { page, limit, skip, sort };
};

export const formatPaginatedResponse = ({ data, total, page, limit, message = 'Success' }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    status: 'success',
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

