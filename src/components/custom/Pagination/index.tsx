"use client";

import { useMemo } from "react";

import { PaginationEllipsis } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import ChevronLeftIcon from "~/icons/ChevronLeftIcon.svg";
import ChevronRightIcon from "~/icons/ChevronRightIcon.svg";
import SkipEndIcon from "~/icons/SkipEndIcon.svg";
import SkipTopIcon from "~/icons/SkipTopIcon.svg";

import CustomSelect from "../Select";

export type PaginationType = {
  pageNum: number;
  pageSize: number;
  total: number;
};

interface PaginationProps {
  className?: string;
  changePageNum?: (pageNum: number) => void;
  changePageSize?: (pageSize: number) => void;
}

const IconWrapper = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      className={cn(
        "h-[32px] w-[32px] flex justify-center items-center cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Pagination = (props: PaginationProps & PaginationType) => {
  const { className, pageNum, pageSize, total, changePageNum, changePageSize } =
    props;

  const totalPages = Math.ceil(total / pageSize);
  const isFirstPage = pageNum === 1;
  const isLastPage = pageNum === totalPages;

  const handleChangePageNum = (
    type: "skipTop" | "left" | "right" | "skipEnd"
  ) => {
    if (!changePageNum) return;

    switch (type) {
      case "skipTop":
        if (!isFirstPage) {
          changePageNum(1);
        }
        break;
      case "left":
        if (!isFirstPage) {
          changePageNum(pageNum - 1);
        }
        break;
      case "right":
        if (!isLastPage) {
          changePageNum(pageNum + 1);
        }
        break;
      case "skipEnd":
        if (!isLastPage) {
          changePageNum(totalPages);
        }
        break;
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;
    const halfRange = Math.floor(maxPagesToShow / 2);

    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than maxPagesToShow, show all pages
      startPage = 1;
      endPage = totalPages;
    } else {
      if (pageNum <= halfRange) {
        // If the current page is in the first half of the range
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (pageNum + halfRange >= totalPages) {
        // If the current page is in the last half of the range
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        // Current page is in the middle
        startPage = pageNum - halfRange;
        endPage = pageNum + halfRange;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageStart = useMemo(() => {
    return (pageNum - 1) * pageSize + 1;
  }, [pageNum, pageSize]);

  const pageEnd = useMemo(() => {
    return Math.min(pageNum * pageSize, total);
  }, [pageNum, pageSize, total]);

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center text-[#324664] text-[16px] font-[390]">
        Showing {pageStart} to {pageEnd} of {total} entries
      </div>
      <div className="flex items-center gap-2 h-10 mx-[20px] text-[#324664] text-[16px] font-[390]">
        <div>Show</div>
        <CustomSelect
          className="w-[100px]"
          value={pageSize}
          onChange={(value) => {
            changePageSize && changePageSize(value);
          }}
          options={[
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
          ]}
          menuPlacement="top"
        ></CustomSelect>
        <div>entries</div>
      </div>
      <IconWrapper
        onClick={() => handleChangePageNum("skipTop")}
        className={cn(isFirstPage && "text-[#ababab] cursor-not-allowed")}
      >
        <SkipTopIcon width={10} height={10} />
      </IconWrapper>
      <IconWrapper
        onClick={() => handleChangePageNum("left")}
        className={cn(
          "m-[0_8px_0]",
          isFirstPage && "text-[#ababab] cursor-not-allowed"
        )}
      >
        <ChevronLeftIcon width={10} height={10} />
      </IconWrapper>
      {getPageNumbers().map((itemPageNum) => {
        const currentPage = pageNum === itemPageNum;
        return (
          <div
            onClick={() => {
              if (itemPageNum !== pageNum) {
                changePageNum && changePageNum(itemPageNum);
              }
            }}
            key={itemPageNum}
            className={cn(
              "h-[32px] w-[32px] rounded-[50%] flex justify-center items-center cursor-pointer mr-[6px]",
              currentPage && "bg-primary",
              currentPage && "text-white"
            )}
          >
            {itemPageNum}
          </div>
        );
      })}
      {totalPages > 7 && totalPages - pageNum >= 4 && <PaginationEllipsis />}
      <IconWrapper
        onClick={() => handleChangePageNum("right")}
        className={cn(
          "mr-[8px]",
          isLastPage && "text-[#ababab] cursor-not-allowed"
        )}
      >
        <ChevronRightIcon width={10} height={10} />
      </IconWrapper>
      <IconWrapper
        onClick={() => handleChangePageNum("skipEnd")}
        className={cn(isLastPage && "text-[#ababab] cursor-not-allowed")}
      >
        <SkipEndIcon width={10} height={10} />
      </IconWrapper>
    </div>
  );
};

export default Pagination;
