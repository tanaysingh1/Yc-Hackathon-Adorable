"use client";

import Image from "next/image";
import {
  PromptInput,
  // PromptInputAction,
  // PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, SquareIcon, Paperclip, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { compressImage, CompressedImage } from "@/lib/image-compression";

interface PromptInputBasicProps {
  onSubmit?: (e?: React.FormEvent<HTMLFormElement>) => void;
  onSubmitWithImages?: (text: string, images: CompressedImage[]) => void;
  isGenerating?: boolean;
  input?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  stop: () => void;
}

export function PromptInputBasic({
  onSubmit: handleSubmit,
  onSubmitWithImages,
  stop,
  isGenerating = false,
  input = "",
  onValueChange,
  disabled,
}: PromptInputBasicProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(isGenerating);
  }, [isGenerating]);

  const MAX_IMAGES = 5; // Maximum number of images allowed

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    // Check if adding these files would exceed the limit
    const currentImageCount = images.length;
    const newFilesCount = Array.from(files).filter(file => file.type.startsWith("image/")).length;
    
    if (currentImageCount + newFilesCount > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images. Currently have ${currentImageCount}, trying to add ${newFilesCount}.`);
      return;
    }

    setIsCompressing(true);
    const newImages: CompressedImage[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        try {
          const compressed = await compressImage(file);
          newImages.push(compressed);
        } catch (error) {
          console.error("Failed to compress image:", error);
        }
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setIsCompressing(false);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWithData = () => {
    if (onSubmitWithImages && (input.trim() || images.length > 0)) {
      onSubmitWithImages(input, images);
      setImages([]);
    } else if (handleSubmit) {
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {images.length} image{images.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setImages([])}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.data}
                  alt={`Upload ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b text-center">
                  {Math.round(image.compressedSize / 1024)}KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PromptInput
        value={input}
        onValueChange={(value) => onValueChange?.(value)}
        isLoading={isLoading || isCompressing}
        onSubmit={handleSubmitWithData}
        className="w-full border dark:bg-accent shadow-sm rounded-lg border-gray-300focus-within:border-gray-400 focus-within:ring-1 transition-all duration-200 ease-in-out focus-within:ring-gray-200 border-gray-300"
      >
        <PromptInputTextarea
          placeholder={
            isGenerating
              ? "Adorable is working..."
              : isCompressing
                ? "Compressing images..."
                : "Type your message here..."
          }
          className="pr-20 bg-transparent dark:bg-transparent"
          disabled={disabled}
        />
      </PromptInput>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="absolute right-3 bottom-3 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full relative"
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating || disabled || images.length >= MAX_IMAGES}
          title={images.length >= MAX_IMAGES ? `Maximum ${MAX_IMAGES} images allowed` : "Attach images"}
        >
          <Paperclip className="h-4 w-4" />
          {images.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {images.length}
            </span>
          )}
        </Button>

        {isGenerating ? (
          <Button
            variant={"default"}
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={stop}
          >
            <SquareIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant={"default"}
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={
              isGenerating ||
              disabled ||
              (input.trim() === "" && images.length === 0)
            }
            onClick={handleSubmitWithData}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
