// backend/services/searchService.js
exports.searchItems = async (query, filters) => {
  const searchQuery = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  };
  
  if (filters.category) searchQuery.category = filters.category;
  if (filters.minPrice) searchQuery.price = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    searchQuery.price = { ...searchQuery.price, $lte: filters.maxPrice };
  }
  
  return await Item.find(searchQuery).limit(50);
};