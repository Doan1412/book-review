"use client";
import Navigation from "@/components/Navigation";
import Button from "@/components/Button";
import { IoInformationCircleOutline } from "react-icons/io5";
import { useSearchParams, useRouter } from "next/navigation";
import Popup from "@/components/Popup";
import Spinner from "@/components/Spinner";
import { Category } from "@/model/Category";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { AiOutlineDelete } from "react-icons/ai";
import { FiChevronLeft, FiChevronRight, FiEdit, FiSearch} from "react-icons/fi";
import { CgSearch } from "react-icons/cg";
import { useEffect, useState, useCallback } from "react";
import { Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  PaginationItemType,
  PaginationItemRenderProps,
  Input,
  PaginationItemValue,
} from "@nextui-org/react";
import useSWR from "swr";
import classnames from 'classnames';

export default function Categories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [noti, setNoti] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null); 
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null); 
  const [addCategory, setAddCategory] = useState<string>(""); 
  const [isAddCategory, setIsAddCategory] = useState<boolean>(false); 
  const [filterValue, setFilterValue] = useState("");
  const [placeHolder, setPlaceHolder] = useState<string | null>(null);
  const fetcher = (...args) => fetch(...args)
    .then((res) => {
      if (!res.ok) {
        console.error(res.status);
      }
      return res.json();
    })
    .then((body) => {
      setCategories(body.data.categories as Category[]);
      setPages(body.data.total);
      setLoading(false);
    });

  const { data, isLoading } = useSWR(
    process.env.BACKEND_URL + `api/v1/category?page=${page}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );
  const loadingState = loading || (categories?.length === 0 ? "loading" : "idle");

  useEffect(() => {
    setPage(1);
  }, [data]);

  const renderItem = ({
    ref,
    key,
    value,
    isActive,
    onNext,
    onPrevious,
    setPage,
    className,
  }: PaginationItemRenderProps<HTMLButtonElement>) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <button key={key} className={classnames(className, "bg-default-200/50 min-w-8 w-8 h-8")} onClick={onNext}>
          <FiChevronRight />
        </button>
      );
    }
  
    if (value === PaginationItemType.PREV) {
      return (
        <button key={key} className={classnames(className, "bg-default-200/50 min-w-8 w-8 h-8")} onClick={onPrevious}>
          <FiChevronLeft />
        </button>
      );
    }
  
    if (value === PaginationItemType.DOTS) {
      return <button key={key} className={className}>...</button>;
    }
  
    return (
      <button
        ref={ref}
        key={key}
        className={classnames(
          className,
          isActive &&
            "border border-gray-300 px-2 py-1 rounded-md",
        )}
        onClick={() => setPage(value)}
      >
        {value}
      </button>
    );
  };

  const deleteCategory = async (id : string) => {
    try {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", getCookie("token") as string);
        const response = await fetch(
            process.env.BACKEND_URL + "api/v1/category/" + id,
            {
                method: "DELETE",
                headers: headers,
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }
        const data = await response.json();
          if (data.success === true) {
            const updatedResponse = await fetch(
              process.env.BACKEND_URL + "api/v1/category?page=" + page,
              {
                  method: "GET",
                  headers: headers,
              }
            );

            if (!updatedResponse.ok) {
                throw new Error("Failed to fetch updated data");
            }

            const updatedData = await updatedResponse.json();
            setCategories(updatedData.data.categories as Category[]);
            setPages(updatedData.data.total);
            setNoti("Xóa danh mục thành công");
        } else {
            setNoti("Xóa ko thành công");
            console.log("Failed to delete");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

  const UpdateCategory = async () => {
    try {
      if (editingCategoryName == null || editingCategoryName == "") {
        setNoti("Vui lòng nhập đủ các trường");
        return;
      }
      const headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", getCookie("token") as string);
      const response = await fetch(
          process.env.BACKEND_URL + "api/v1/category/" + editingCategoryId,
          {
              method: "PUT",
              headers: headers,
              body: JSON.stringify({
                name: editingCategoryName.trim(),
              }),
          }
      );

      if (!response.ok) {
          throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      if (data.success === true) {
          const updatedResponse = await fetch(
            process.env.BACKEND_URL + "api/v1/category?page=" + page,
            {
                method: "GET",
                headers: headers,
            }
          );

          if (!updatedResponse.ok) {
              throw new Error("Failed to fetch updated data");
          }

          const updatedData = await updatedResponse.json();
          setCategories(updatedData.data.categories as Category[]);
          setPages(updatedData.data.total);

          setNoti("Cập nhật danh mục thành công");
      } else {
          setNoti("Cập nhật ko thành công");
          console.log("Failed to update");
      }
  } catch (error) {
      console.error("Error:", error);
  }
    setEditingCategoryId(null);
  };

  const AddCategory = async () => {
    try {
      const headers = new Headers();
      headers.append("Accept", "application/json");
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", getCookie("token") as string);
      const response = await fetch(
          process.env.BACKEND_URL + "api/v1/category",
          {
              method: "POST",
              headers: headers,
              body: JSON.stringify({
                name: addCategory.trim(),
              }),
          }
      );

      if (!response.ok) {
          throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      if (data.success === true) {
          const updatedResponse = await fetch(
            process.env.BACKEND_URL + "api/v1/category?page=" + page,
            {
                method: "GET",
                headers: headers,
            }
          );

          if (!updatedResponse.ok) {
              throw new Error("Failed to fetch updated data");
          }

          const updatedData = await updatedResponse.json();
          setCategories(updatedData.data.categories as Category[]);
          setPages(updatedData.data.total);

          setNoti("Thêm danh mục thành công");
      } else {
          setNoti("Thêm ko thành công");
          console.log("Failed to add");
      }
  } catch (error) {
      console.error("Error:", error);
  }
    setIsAddCategory(false);
    setAddCategory("");
  };

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(()=>{
    setFilterValue("")
    setPage(1)
  },[])

  return (
    <div className="h-full flex flex-row">
      <Navigation />
      <div className="flex-1 overflow-auto">
        {noti && <Popup message={noti} close={() => setNoti(null)} />}
        {editingCategoryId && 
          <div className="z-50 w-screen h-screen fixed top-0 left-0 bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center">
          <div className="z-50 bg-white rounded-full flex items-center justify-center p-2">
            <IoInformationCircleOutline size={40} color={"blue"} />
          </div>
          <div className="relative z-40 bg-white flex flex-col items-center justify-center -mt-6 px-12 py-6 rounded-xl space-y-4">
          <div className="flex flex-col space-y-6">
          <span className="text-base mt-4">{placeHolder}</span>
            <div className="inputWrap">
              <label htmlFor="ID" className="inputLabel">
                ID
              </label>
              <input
                type="text"
                value={editingCategoryId}
                readOnly
                className="inputField w-96"
              />
            </div>
            <div className="inputWrap">
              <label htmlFor="name" className="inputLabel">
                Danh mục
              </label>
              <input
                type="text"
                value={editingCategoryName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{
                  setEditingCategoryName(e.target.value)
                  if (e.target.value.trim() !== "")
                    setPlaceHolder(null)
                  else 
                    setPlaceHolder("Vui lòng nhập danh mục")
                }}
                className="inputField w-96"
              />
            </div>
            <div className="py-3 px-2 flex justify-between items-center">
              <Button onClick={() => {setEditingCategoryId(null)}}className="bg-[#c7c4bd] text-white mr-5">
                Trở về
              </Button>
              <Button onClick={() => {if (editingCategoryName?.trim() !== "") UpdateCategory()}} className="bg-[#c7c4bd] text-white">
                Cập nhật
              </Button>
            </div>
          </div>
          </div>
        </div>}
        {isAddCategory && 
          <div className="z-50 w-screen h-screen fixed top-0 left-0 bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center">
          <div className="z-50 bg-white rounded-full flex items-center justify-center p-2">
            <IoInformationCircleOutline size={40} color={"blue"} />
          </div>
          <div className="relative z-40 bg-white flex flex-col items-center justify-center -mt-6 px-12 py-6 rounded-xl space-y-4">
          <div className="flex flex-col space-y-6">
          <span className="text-base mt-4">{placeHolder}</span>
            <div className="inputWrap">
              <label htmlFor="username" className="inputLabel">
                Danh mục
              </label>
              <input
                type="text"
                value={addCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>{
                  setAddCategory(e.target.value)
                  if (e.target.value.trim() !== "")
                    setPlaceHolder(null)
                  else 
                    setPlaceHolder("Vui lòng nhập danh mục")
                }}
                className="inputField w-96"
              />
            </div>
            <div className="py-3 px-2 flex justify-between items-center">
              <Button onClick={() => setIsAddCategory(false)}className="bg-[#c7c4bd] text-white mr-5">
                Trở về
              </Button>
              <Button onClick={() => {if (addCategory?.trim() !== "") AddCategory()}} className="bg-[#c7c4bd] text-white">
                Thêm
              </Button>
            </div>
          </div>
          </div>
        </div>}
        <div className="p-6">
          <div className="h-full flex flex-col border-none p-4 flex-1">
            <h3 className="text-center uppercase font-bold text-2xl mb-4">
              Quản lý danh mục
            </h3>
            <div className="h-full flex flex-col p-4 overflow-auto">
              {isLoading && (
                <div className="h-full flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              {categories && (
                <Table
                isStriped
                aria-label="Category Table"
                topContent={
                  <div className="flex items-center space-x-1">
                  <Button onClick={() => setIsAddCategory(true)} className="iconButton">
                    Thêm
                  </Button>
                  </div>
                }
                bottomContent={
                  <div className="py-2 px-2 flex justify-between items-center">
                    <span className="w-[30%] text-small text-default-400">
                      {categories.length} items
                    </span>
                    <Pagination
                      isCompact
                      showShadow
                      showControls
                      page={page}
                      total={pages}
                      onChange={setPage}
                      size="sm" 
                      variant='light'
                      renderItem={renderItem}
                    />
                  </div>
                }
                classNames={{
                  wrapper: "min-h-[222px]",
                  table: "w-full border-collapse",
                  headerRow: "bg-gray-200",
                  headerCell: "py-2 px-4 font-bold text-sm text-gray-600",
                  row: "border-t hover:bg-gray-100",
                  cell: "py-2 px-4 text-sm text-gray-800",
                  loading: "text-center",
                }}
                hover
              >
                <TableHeader
                  style={{
                    backgroundColor: "#c7c4bd",
                    borderBottom: "2px solid #ccc",
                    color: "#333",
                  }}>
                  <TableColumn style={{ fontWeight: "bold" }}>ID</TableColumn>
                  <TableColumn style={{ fontWeight: "bold" }}>Tên danh mục</TableColumn>
                  <TableColumn style={{ fontWeight: "bold" }}>Created At</TableColumn>
                  <TableColumn style={{ fontWeight: "bold" }}>Updated At</TableColumn>
                  <TableColumn style={{ fontWeight: "bold" }}> </TableColumn>
                </TableHeader>
                <TableBody
                  loadingContent={<Spinner />}
                  loadingState={loadingState}
                >
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell >{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.created_at.toString().split('.')[0]}</TableCell>
                      <TableCell>{category.updated_at?.toString().split('.')[0]}</TableCell>
                      <TableCell>
                        <div className="relative flex items-center gap-2">
                          <Button onClick={() => {setEditingCategoryId(category.id); setEditingCategoryName(category.name)}} className="iconButton">
                              <FiEdit size={20} />
                          </Button>
                          <Button onClick={() => deleteCategory(category.id)} className="iconButton">
                              <AiOutlineDelete size={20} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
