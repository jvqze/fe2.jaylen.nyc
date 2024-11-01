import React from "react";

interface ModalProps {
    onClose: () => void;
    onConfirm: (isPrivate: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-80 rounded-lg bg-neutral-800 p-6 text-white shadow-lg">
                <h2 className="mb-4 text-lg font-semibold">Upload Options</h2>
                <p className="mb-6 text-gray-300">Do you want to make this audio public?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => onConfirm(false)}
                        className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-700"
                    >
                        Private
                    </button>
                    <button
                        onClick={() => onConfirm(true)}
                        className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
                    >
                        Public
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;