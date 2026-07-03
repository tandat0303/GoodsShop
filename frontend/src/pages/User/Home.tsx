import { BANNER_SLIDES } from "../../libs/constance";
import CategoryStrip from "./main/CategoryStrip";
import FeatureHighlights from "./main/FeatureHighlights";
import HeroBanner from "./main/HeroBanner";
import ProductList from "./main/ProductList";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <HeroBanner slides={BANNER_SLIDES} />
      <CategoryStrip />
      <FeatureHighlights />
      <ProductList pageSize={8} />
    </div>
  );
}
