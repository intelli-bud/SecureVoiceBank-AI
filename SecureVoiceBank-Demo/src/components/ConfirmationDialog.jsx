import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

function ConfirmationDialog({
    title,
    description,
    confirmLabel,
    onConfirm,
    onCancel,
}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return undefined;
        }

        if (!dialog.open) {
            dialog.showModal();
        }

        return () => {
            if (dialog.open) {
                dialog.close();
            }
        };
    }, []);

    const handleCancel = (event) => {
        event.preventDefault();
        onCancel();
    };

    return (
        <dialog
            ref={dialogRef}
            className="confirmation-dialog"
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
            onCancel={handleCancel}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div className="confirmation-dialog-icon" aria-hidden="true">
                <AlertTriangle size={21} />
            </div>

            <div className="confirmation-dialog-copy">
                <h2 id="confirmation-dialog-title">{title}</h2>
                <p id="confirmation-dialog-description">{description}</p>
            </div>

            <div className="confirmation-dialog-actions">
                <button
                    type="button"
                    className="confirmation-dialog-cancel"
                    onClick={onCancel}
                    autoFocus
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="confirmation-dialog-confirm"
                    onClick={onConfirm}
                >
                    <AlertTriangle size={15} />
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}

export default ConfirmationDialog;
