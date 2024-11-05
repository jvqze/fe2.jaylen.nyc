import React, { useState } from "react";

interface ModalProps {
    onClose: () => void;
    onConfirm: (isPrivate: boolean, title: string) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onConfirm }) => {
    const [title, setTitle] = useState("");

    const handleConfirm = (isPrivate: boolean) => {
        if (title.trim() === "") {
            alert("Please enter a title for the audio file.");
            return;
        }
        onConfirm(isPrivate, title);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-80 rounded-lg bg-neutral-800 p-6 text-white shadow-lg">
                <h2 className="mb-4 text-lg font-semibold">Upload Options</h2>
                <input
                    type="text"
                    id="title"
                    className="mb-6 w-full rounded-md bg-gray-700 p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a title for your audio"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => handleConfirm(true)}
                        className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-700"
                    >
                        Private
                    </button>
                    <button
                        onClick={() => handleConfirm(false)}
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
