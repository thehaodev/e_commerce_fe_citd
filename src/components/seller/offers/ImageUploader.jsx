import React, { useCallback, useRef, useState } from "react";
import { FiUpload, FiX, FiArrowLeft, FiArrowRight, FiLoader } from "react-icons/fi";
import { uploadImage } from "../../../api/uploadApi";

const MAX_IMAGES = 5;
const getUploadUrl = (res) => {
  if (!res) return "";
  if (typeof res === "string") return res;
  return (
    res?.url ||
    res?.secure_url ||
    res?.path ||
    res?.data?.url ||
    res?.data?.secure_url ||
    res?.data?.path
  );
};

const ImageUploader = ({ value = [], onChange, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const inputRef = useRef(null);

  const triggerInput = () => {
    inputRef.current?.click();
  };

  const updateItem = useCallback(
    (id, patch) => {
      onChange?.((prev) =>
        (prev || []).map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    [onChange]
  );

  const uploadSingle = useCallback(
    async (item) => {
      if (!item?.file) return;
      setUploadingId(item.id);
      updateItem(item.id, { uploading: true, error: "" });
      try {
        const res = await uploadImage(item.file);
        const url = getUploadUrl(res);
        if (!url) throw new Error("Upload failed");
        updateItem(item.id, { url, uploading: false });
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Upload failed";
        updateItem(item.id, { uploading: false, error: message });
      } finally {
        setUploadingId(null);
      }
    },
    [updateItem]
  );

  const handleFiles = useCallback(
    (files) => {
      const incoming = Array.from(files || []);
      if (!incoming.length) return;

      const available = Math.max(0, MAX_IMAGES - value.length);
      const accepted = incoming.slice(0, available).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      }));

      const next = [...value, ...accepted];
      onChange?.(next);

      accepted.forEach((item) => uploadSingle(item));
    },
    [onChange, uploadSingle, value]
  );

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleRemove = (id) => {
    const target = value.find((item) => item.id === id);
    if (target?.preview) URL.revokeObjectURL(target.preview);
    const next = value.filter((item) => item.id !== id);
    onChange?.(next);
  };

  const move = (id, direction) => {
    const index = value.findIndex((item) => item.id === id);
    if (index === -1) return;
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={triggerInput}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-8 transition ${
          dragActive
            ? "border-amber-400 bg-amber-50"
            : "border-slate-300 bg-slate-50 hover:border-amber-300"
        }`}
      >
        <div className="flex flex-col items-center text-center gap-2 text-slate-700">
          <div className="h-12 w-12 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center">
            <FiUpload className="text-amber-500" size={20} />
          </div>
          <p className="font-semibold text-slate-900">Upload product images</p>
          <p className="text-sm text-slate-600">
            Drag & drop or click to browse. Max 5 images.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {value.map((item, index) => (
            <div
              key={item.id}
              className="relative w-28 h-28 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white"
            >
              <img
                src={item.url || item.preview}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute top-1 right-1 rounded-full bg-white/90 p-1 shadow hover:bg-rose-50"
              >
                <FiX className="text-rose-600" size={14} />
              </button>
              {item.uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-amber-600">
                  <FiLoader className="animate-spin" size={16} />
                  <span className="text-[11px] font-semibold">Uploading</span>
                </div>
              )}
              {item.error && !item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-center px-2">
                  <span className="text-[11px] font-semibold text-rose-600">
                    {item.error}
                  </span>
                </div>
              )}
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(item.id, "left")}
                  className="rounded-full bg-white/90 p-1 shadow hover:bg-slate-50 disabled:opacity-40"
                  disabled={index === 0}
                  title="Move left"
                >
                  <FiArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(item.id, "right")}
                  className="rounded-full bg-white/90 p-1 shadow hover:bg-slate-50 disabled:opacity-40"
                  disabled={index === value.length - 1}
                  title="Move right"
                >
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadingId && (
        <p className="text-xs font-semibold text-amber-600">Uploading image...</p>
      )}

      {value.length >= MAX_IMAGES && (
        <p className="text-xs font-semibold text-amber-600">
          You reached the maximum of 5 images. Remove one to add another.
        </p>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;
