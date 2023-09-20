import { Meta, StoryObj } from "@storybook/react";
import { FavoritesSource } from "../../search/FavoritesSource";
import FavoriteStar from "./FavoriteStar";

const meta = {
  component: FavoriteStar,
} satisfies Meta<typeof FavoriteStar>;

export default meta;
type Story = StoryObj<typeof meta>;

class SingleAddressFavoriteSource extends FavoritesSource {
  private targetAddress: string;
  private longLoad: boolean;
  constructor(targetAddress: string, longLoad: boolean = false) {
    super();
    this.targetAddress = targetAddress;
    this.longLoad = longLoad;
  }
  async isFavorite(address: string): Promise<boolean> {
    if (this.longLoad) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return address === this.targetAddress;
  }
  async getFavorites(): Promise<string[]> {
    return [this.targetAddress];
  }
  async setFavorite(address: string, isFavorite: boolean): Promise<void> {
    if (this.longLoad) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

const singleFavSource = new SingleAddressFavoriteSource(
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
);
const singleFavSourceLongLoad = new SingleAddressFavoriteSource(
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  true,
);

export const FavoritedStar: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    favoritesSource: singleFavSource,
  },
};

export const FavoritedStarLongLoad: Story = {
  args: {
    address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    favoritesSource: singleFavSourceLongLoad,
  },
};
