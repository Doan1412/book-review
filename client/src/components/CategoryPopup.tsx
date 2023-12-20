import { IoInformationCircleOutline } from "react-icons/io5";
import Button from "./Button";

interface PopupProps {
  editingCategoryId: string;
  editingCategoryName: string;
  close: () => void;
  update: () => void;
  setEditingCategoryName: (Name: string) => void;
}

export default function Popup({ editingCategoryId, editingCategoryName, close, update, setEditingCategoryName}: PopupProps) {
  return (
    <div className="z-50 w-screen h-screen fixed top-0 left-0 bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center">
      <div className="z-50 bg-white rounded-full flex items-center justify-center p-2">
        <IoInformationCircleOutline size={40} color={"blue"} />
      </div>
      <div className="relative z-40 bg-white flex flex-col items-center justify-center -mt-6 px-12 py-6 rounded-xl space-y-4">
      <div className="flex flex-col space-y-6">
        <div className="inputWrap">
          <label htmlFor="username" className="inputLabel">
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
          <label htmlFor="username" className="inputLabel">
            ID
          </label>
          <input
            type="text"
            value={editingCategoryName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditingCategoryName(e.target.value)
            }
            className="inputField w-96"
          />
        </div>
        <div className="py-3 px-2 flex justify-between items-center">
          <Button onClick={close} className="bg-[#c7c4bd] text-white mr-5">
            Trở về
          </Button>
          <Button onClick={update} className="bg-[#c7c4bd] text-white">
            Cập nhật
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
