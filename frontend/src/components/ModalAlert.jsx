import React from "react";
import { AlertCircle, CheckCircle, Info, HelpCircle } from "lucide-react";
import "./ModalAlert.css";

export default function ModalAlert({ 
  isOpen, 
  type = "info", 
  title, 
  message, 
  onClose, 
  onConfirm 
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="modal-alert-icon text-success" size={48} />;
      case "error":
        return <AlertCircle className="modal-alert-icon text-danger" size={48} />;
      case "confirm":
        return <HelpCircle className="modal-alert-icon text-confirm" size={48} />;
      default:
        return <Info className="modal-alert-icon text-info" size={48} />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error / Warning";
      case "confirm":
        return "Are you sure?";
      default:
        return "Notification";
    }
  };

  return (
    <div className="modal-alert-overlay">
      <div className={`modal-alert-card slide-down ${type}`}>
        <div className="modal-alert-header">
          {getIcon()}
          <h3>{getTitle()}</h3>
        </div>
        <div className="modal-alert-body">
          <p>{message}</p>
        </div>
        <div className="modal-alert-footer">
          {type === "confirm" ? (
            <>
              <button type="button" className="btn-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn-modal-confirm" onClick={() => { onConfirm(); onClose(); }}>
                Yes, Proceed
              </button>
            </>
          ) : (
            <button type="button" className="btn-modal-close" onClick={onClose}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
