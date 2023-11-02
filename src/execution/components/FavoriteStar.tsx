import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useEffect, useState } from "react";
import {
  DefaultFavoritesSource,
  FavoritesSource,
} from "../../search/FavoritesSource";
import { AddressAwareComponentProps } from "../types";

interface FavoriteStarProps extends AddressAwareComponentProps {
  favoritesSource?: FavoritesSource;
}

const FavoriteStar: FC<FavoriteStarProps> = ({
  address,
  favoritesSource = DefaultFavoritesSource,
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    setIsFavorite(false);
    favoritesSource.isFavorite(address).then((isFav) => {
      setIsFavorite(isFav);
      setIsLoading(false);
    });
  }, [address]);

  function toggleFavorite() {
    if (isLoading) {
      return;
    }
    const prevFavorite = isFavorite;
    setIsFavorite(!prevFavorite);
    setIsLoading(true);
    favoritesSource
      .setFavorite(address, !prevFavorite)
      .then(() => setIsLoading(false));
  }

  return (
    <span
      className={isFavorite ? "text-blue-700" : "text-gray-500"}
      title="Favorite"
    >
      <button onClick={toggleFavorite}>
        <FontAwesomeIcon
          icon={isFavorite ? faStar : faStarRegular}
          size="1x"
          className={isLoading ? "animate-pulse" : ""}
        />
      </button>
    </span>
  );
};

export default FavoriteStar;
