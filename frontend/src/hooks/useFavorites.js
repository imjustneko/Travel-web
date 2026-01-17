
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  
  const addFavorite = async (itemId) => {
    // API call
  };
  
  const removeFavorite = async (itemId) => {
    // API call
  };
  
  const isFavorite = (itemId) => {
    return favorites.some(fav => fav.item === itemId);
  };
  
  return { favorites, addFavorite, removeFavorite, isFavorite };
};