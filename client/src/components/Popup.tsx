import { IoInformationCircleOutline } from "react-icons/io5";
import Button from "./Button";

interface PopupProps {
  message: string;
  close: () => void;
}

export default function Popup({ message, close }: PopupProps) {
  return (
    <div className="z-50 w-screen h-screen fixed top-0 left-0 bg-gray-500 bg-opacity-50 flex flex-col items-center justify-center">
      <div className="z-50 bg-white rounded-full flex items-center justify-center p-2">
        <IoInformationCircleOutline size={40} color={"blue"} />
      </div>
      <div className="relative z-40 bg-white flex flex-col items-center justify-center -mt-6 px-12 py-6 rounded-xl space-y-4">
        <span className="text-base mt-4">{message}</span>
        <Button onClick={close} className="bg-red-500 text-white">
          Đóng
        </Button>
      </div>
    </div>
  );
}
