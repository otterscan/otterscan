import { useEffect, useState } from "react";

export abstract class FavoritesSource {
  protected favorites: string[] | null = null;
  abstract isFavorite(address: string): Promise<boolean>;
  abstract getFavorites(): Promise<string[]>;
  abstract setFavorite(address: string, isFavorite: boolean): Promise<void>;
}

class LocalFavoritesSource extends FavoritesSource {
  private readonly key = "favoriteAddresses"; // key for storing favorite addresses in local storage

  async isFavorite(address: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(address);
  }

  async getFavorites(): Promise<string[]> {
    if (this.favorites !== null) {
      return this.favorites; // use cached list of favorites if available
    } else {
      const favoritesJSON = localStorage.getItem(this.key);
      const favorites = JSON.parse(favoritesJSON || "[]"); // initialize as empty array if not found in storage
      if (!Array.isArray(favorites)) {
        throw new Error("Favorites not an array");
      }
      this.favorites = favorites;
      return this.favorites;
    }
  }

  async addFavorite(address: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(address)) {
      favorites.push(address);
      this.favorites = favorites;
      localStorage.setItem(this.key, JSON.stringify(this.favorites));
    }
  }

  async removeFavorite(addressToRemove: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (favorites.includes(addressToRemove)) {
      this.favorites = favorites.filter(
        (address) => address !== addressToRemove,
      );
      localStorage.setItem(this.key, JSON.stringify(this.favorites));
    }
  }

  async setFavorite(address: string, isFavorite: boolean): Promise<void> {
    return isFavorite
      ? this.addFavorite(address)
      : this.removeFavorite(address);
  }
}

export const DefaultFavoritesSource: FavoritesSource =
  new LocalFavoritesSource();

export function useIsFavorite(
  address: string,
  favorites: FavoritesSource | null = DefaultFavoritesSource,
) {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useEffect(() => {
    async function checkIsFavorite() {
      if (favorites === null) {
        return;
      }
      const result = await favorites.isFavorite(address);
      setIsFavorite(result);
    }
    checkIsFavorite();
  }, [favorites, address]);

  return isFavorite;
}
