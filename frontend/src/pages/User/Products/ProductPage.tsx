import { useState } from "react";
import { useProductCatalog } from "../../../hooks/useProductCatalog";
import ProductToolbar from "./ProductToolbar";
import FilterOverlay from "./FilterOverlay";
import ProductGrid from "./ProductGrid";

const PAGE_SIZE = 12;

export default function ProductPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    loading,
    categories,
    brands,
    filters,
    updateFilters,
    filteredCount,
    pageItems,
    page,
    setPage,
    totalPages,
  } = useProductCatalog(PAGE_SIZE);

  const handlePageChange = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117]">
      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
            Tất cả sản phẩm
          </h1>
          <p className="text-[13px] text-slate-400">
            Tìm kiếm, lọc và khám phá sản phẩm phù hợp với bạn
          </p>
        </div>

        <div className="sticky top-0 z-20 -mx-4 bg-slate-50/90 px-4 py-2 backdrop-blur-sm dark:bg-[#0d1117]/90 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <ProductToolbar
            filters={filters}
            onChange={updateFilters}
            categories={categories}
            brands={brands}
            resultCount={filteredCount}
            onOpenFilters={() => setFilterOpen(true)}
          />
        </div>

        <ProductGrid
          loading={loading}
          items={pageItems}
          pageSize={PAGE_SIZE}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>

      <FilterOverlay
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={updateFilters}
        brands={brands}
      />
    </div>
  );
}
