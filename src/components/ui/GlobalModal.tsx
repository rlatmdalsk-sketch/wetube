import { useModalStore } from "../../store/ModalStore.ts";
import Backdrop from "./Backdrop.tsx";
import { MdClose } from "react-icons/md";
import DaumPostcodeEmbed from "react-daum-postcode";

export default function GlobalModal() {
    const { isOpen, type, props, closeModal } = useModalStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 1. 백드롭 (클릭 시 닫힘) */}
            <Backdrop onClose={closeModal} className="bg-black/60 backdrop-blur-sm" />

            {/* 2. 모달 컨텐츠 (실제 팝업창) */}
            <div className="relative z-10 animate-fade-in-up">
                {/* 닫기 버튼 (공통) */}
                <button
                    onClick={closeModal}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
                    <MdClose size={32} />
                </button>

                {/* 타입에 따른 컨텐츠 렌더링 */}
                {type === "LOGIN_REQUIRED" && <LoginRequiredModal onClose={closeModal} />}

                {/* 주소 찾기 모달 연결 */}
                {type === "ADDRESS_SEARCH" && (
                    <AddressSearchModal
                        onClose={closeModal}
                        onComplete={props?.onComplete} // SignUp 페이지에서 넘겨준 콜백
                    />
                )}
            </div>
        </div>
    );
}

const LoginRequiredModal = ({ onClose }: { onClose: VoidFunction }) => (
    <div className="bg-background-paper p-6 rounded-lg shadow-xl w-80 text-center border border-divider">
        <h2 className="text-xl font-bold mb-2 text-text-default">로그인 필요</h2>
        <p className="text-text-disabled mb-4">이 기능을 사용하려면 로그인이 필요합니다.</p>
        <div className="flex justify-center gap-2">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-text-default/10 rounded hover:bg-text-default/20 text-text-default">
                닫기
            </button>
            <a
                href="/sign-in"
                className="px-4 py-2 bg-primary-main text-white rounded hover:opacity-90">
                로그인하기
            </a>
        </div>
    </div>
);

// 2. ✨ 주소 검색 모달 컴포넌트 추가
const AddressSearchModal = ({
    onClose,
    onComplete,
}: {
    onClose: () => void;
    onComplete: (data: any) => void;
}) => {
    const handleComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
            if (data.bname !== "") {
                extraAddress += data.bname;
            }
            if (data.buildingName !== "") {
                extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
        }

        // 선택된 데이터(우편번호, 주소)를 부모에게 전달
        onComplete({
            zonecode: data.zonecode,
            address: fullAddress,
        });

        onClose(); // 선택 후 모달 닫기
    };

    return (
        <div className="bg-background-paper p-4 rounded-lg shadow-xl w-full max-w-[500px] border border-divider">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-text-default">주소 검색</h2>
            </div>
            {/* 다음 우편번호 라이브러리 임베드 */}
            <div className="h-[400px] border border-divider">
                <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: "100%" }} />
            </div>
        </div>
    );
};
