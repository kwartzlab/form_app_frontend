import React from 'react';
import { Upload, X } from 'lucide-react';

export default function FileUploadSection({
    files,
    fileInputRef,
    onFileChange,
    onRemoveFile,
    onUploadClick,
    formatFileSize
}) {
    return(
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded p-4">
            <input
              type="file"
              multiple
              onChange={onFileChange}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />
            <button
                type="button"
                onClick={onUploadClick}
                className="flex items-center justify-center gap-2 w-full cursor-pointer text-blue-600 hover:text-blue-800"
            >
                <Upload size={20} />
                <span>Click to upload files</span>
            </button>
            
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm text-gray-700">
                    {file.name} ({formatFileSize(file.size)})
                  </span>
                  <button
                    type="button"
                    onClick={onRemoveFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16}/>
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
    );
}