import { twMerge } from "tailwind-merge";

interface BackdropProps {
    onClose: () => void;
    className?: string;
}

function Backdrop({ onClose, className }: BackdropProps) {
    return (
        <div
            className={twMerge(["fixed", "inset-0", "cursor-default", className])}
            onClick={onClose}
            aria-hidden={"true"}
        />
    );
}

export default Backdrop;
