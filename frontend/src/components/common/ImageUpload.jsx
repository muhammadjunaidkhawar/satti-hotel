import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const ImageUpload = forwardRef(({ name, label, required = false, existingImageUrl = null }, ref) => {
  const { register, setValue, watch, formState: { errors }, trigger } = useFormContext();
  const currentValue = watch(name);
  const [preview, setPreview] = useState(existingImageUrl || currentValue || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const selectedFileRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  // Register the field with custom validation
  useEffect(() => {
    register(name, {
      required: required ? 'Image is required' : false,
      validate: (value) => {
        // If a file is selected (check both state and ref for reliability), validation passes
        if (selectedFileRef.current || value === 'FILE_SELECTED') {
          return true;
        }
        // If value exists (URL), validation passes
        if (value && value !== 'FILE_SELECTED') {
          return true;
        }
        // If not required, validation passes
        if (!required) {
          return true;
        }
        // Otherwise, validation fails
        return 'Image is required';
      },
    });
  }, [register, name, required]);

  // Update preview when existingImageUrl or currentValue changes
  useEffect(() => {
    if (existingImageUrl || currentValue) {
      setPreview(existingImageUrl || currentValue);
    }
  }, [existingImageUrl, currentValue]);

  // Expose the selected file to parent component via ref
  useImperativeHandle(ref, () => ({
    getFile: () => selectedFile,
    clearFile: () => {
      setSelectedFile(null);
      setPreview(existingImageUrl || currentValue || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setValue(name, existingImageUrl || currentValue || '', { shouldValidate: true });
    },
  }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      fileInputRef.current.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    // Store the file for later upload
    setSelectedFile(file);

    // Set a placeholder value in the form to satisfy validation
    // This will be replaced with the actual URL after upload
    setValue(name, 'FILE_SELECTED', { shouldValidate: true, shouldDirty: true });
    
    // Trigger validation to clear any errors
    trigger(name);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(existingImageUrl || currentValue || null);
    setValue(name, existingImageUrl || currentValue || '', { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div className="space-y-3">
        {/* Preview */}
            {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-600"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div className="relative">
            <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${name}`}
          />
          <label
            htmlFor={`file-input-${name}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-600 bg-[#1a1a1a] hover:border-[#FF9500] hover:bg-[#1f1f1f]"
          >
            <div className="flex flex-col items-center">
              <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-2xl mb-2"></i>
              <span className="text-sm text-gray-400">
                {preview ? 'Change Image' : 'Click to upload image'}
              </span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
            </div>
          </label>
        </div>

        {/* Hidden input for react-hook-form - value is managed by setValue, already registered in useEffect */}
        <input type="hidden" name={name} />

        {/* Error message */}
        {errors[name] && (
          <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>
        )}
      </div>
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;
