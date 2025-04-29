import React, { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import ComponentCard from '../../common/ComponentCard';
import { useDropzone } from 'react-dropzone';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../../api/axiosInstance';
import axios from 'axios';

interface PreviewFile {
  file: File; // Store the original File object
  preview: string;
  id: string;
  isThumbnail: boolean;
}

interface UploadedFile {
  key: string;
  isThumbnail: boolean;
}

interface DropzoneComponentProps {
  onDrop?: (acceptedFiles: File[]) => void;
  setFiles: React.Dispatch<React.SetStateAction<PreviewFile[]>>;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({ onDrop, setFiles }) => {
  const defaultOnDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Filter out files with undefined name or type
      const validFiles = acceptedFiles.filter((file) => file.name && file.type);
      if (validFiles.length !== acceptedFiles.length) {
        console.warn('Some files were skipped due to missing name or type');
      }

      const newFiles = validFiles.map((file, index) => ({
        file, // Store the original File object
        preview: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}-${index}`,
        isThumbnail: false,
      }));
      setFiles((prev) => {
        const updatedFiles = [...prev, ...newFiles];
        const hasThumbnail = updatedFiles.some((f) => f.isThumbnail);
        if (!hasThumbnail && updatedFiles.length > 0) {
          updatedFiles[0].isThumbnail = true;
        }
        return updatedFiles;
      });
      onDrop?.(validFiles);
    },
    [onDrop, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: defaultOnDrop,
    accept: {
      'image/png': [],
      'image/jpeg': [],
      'image/webp': [],
      'image/svg+xml': [],
    },
  });

  return (
    <ComponentCard title="Dropzone">
      <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
        <form
          {...getRootProps()}
          className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
            ${isDragActive ? 'border-brand-500 bg-gray-100 dark:bg-gray-800' : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'}`}
          id="demo-upload"
        >
          <input {...getInputProps()} />
          <div className="dz-message flex flex-col items-center m-0">
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="mb-3 font-semibold text-gray-800 text-xl dark:text-white/90">
              {isDragActive ? 'Drop Files Here' : 'Drag & Drop Files Here'}
            </h4>
            <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
              Drag and drop your PNG, JPG, WebP, SVG images here or browse
            </span>
            <span className="font-medium underline text-sm text-brand-500">
              Browse File
            </span>
          </div>
        </form>
      </div>
    </ComponentCard>
  );
};

const ThumbnailRadio = styled(Radio)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.54)',
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
}));

interface PreviewImageListProps {
  files: PreviewFile[];
  setFiles: React.Dispatch<React.SetStateAction<PreviewFile[]>>;
}

const PreviewImageList: React.FC<PreviewImageListProps> = ({ files, setFiles }) => {
  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== id);
      if (updatedFiles.length > 0 && !updatedFiles.some((f) => f.isThumbnail)) {
        updatedFiles[0].isThumbnail = true;
      }
      return updatedFiles;
    });
  };

  const handleThumbnailChange = (id: string) => {
    setFiles((prev) =>
      prev.map((file) => ({
        ...file,
        isThumbnail: file.id === id,
      }))
    );
  };

  return (
    <ImageList cols={3} gap={8}>
      {files.map((file) => (
        <ImageListItem
          key={file.id}
          sx={{
            height: 'auto',
            maxWidth: '200px',
            ...(file.isThumbnail && {
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: '4px',
            }),
          }}
        >
          <img
            src={file.preview}
            alt={file.file.name}
            loading="lazy"
            style={{ height: '100%', maxHeight: '150px', objectFit: 'cover', width: '100%' }}
          />
          <ImageListItemBar
            title={file.file.name}
            sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
            actionIcon={
              <>
                <IconButton
                  sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                  aria-label={`remove ${file.file.name}`}
                  onClick={() => handleRemove(file.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <ThumbnailRadio
                  checked={file.isThumbnail}
                  onChange={() => handleThumbnailChange(file.id)}
                  value={file.id}
                  name="thumbnail-radio"
                  aria-label={`set ${file.file.name} as thumbnail`}
                />
              </>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export interface ImageUploadManagerRef {
  handleUpload: () => Promise<UploadedFile[]>;
}

interface ImageUploadManagerProps {
  onUploadSuccess?: (uploadedFiles: UploadedFile[]) => void; 
}

const ImageUploadManager = forwardRef<ImageUploadManagerRef, ImageUploadManagerProps>(({ onUploadSuccess }, ref) => {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Dropped files:', acceptedFiles);
  }, []);

  const handleUpload = async (): Promise<UploadedFile[]> => {
    if (files.length === 0) {
      setUploadStatus('No files to upload');
      return [];
    }

    setUploadStatus('Uploading...');
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (const file of files) {
        // Log file details for debugging
        console.log('File details:', { name: file.file.name, type: file.file.type });

        // Validate file name and content type
        if (!file.file.name || file.file.name === 'FormData_F_Blob_F' || !file.file.type) {
          console.warn(`Skipping file due to invalid name or type: ${file.file.name}`);
          continue; // Skip this file and move to the next
        }

        // Step 1: Get presigned URL from backend
        const response = await axiosInstance.post('/api/Image/presigned', {
          fileName: file.file.name,
          contentType: file.file.type,
        });

        const { key, url } = response.data;
        console.log('Presigned URL response:', response.data);

        // Step 2: Upload file to S3 using presigned URL
        await axios.put(url, file.file, {
          headers: {
            'Content-Type': file.file.type,
            'x-amz-meta-file-name': file.file.name
          },
        });

        // Add the uploaded file with isThumbnail property
        uploadedFiles.push({
          key,
          isThumbnail: file.isThumbnail
        });
      }

      if (uploadedFiles.length === 0) {
        setUploadStatus('No valid files were uploaded');
        return [];
      }

      setUploadStatus('Upload successful!');
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      setFiles([]);

      // Call the onUploadSuccess callback with the uploaded files including thumbnail info
      onUploadSuccess?.(uploadedFiles);
      return uploadedFiles;
    } catch (error: any) {
      setUploadStatus(`Upload failed: ${error.message}`);
      console.error('Upload error:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    handleUpload,
  }));

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <DropzoneComponent onDrop={handleDrop} setFiles={setFiles} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploadStatus === 'Uploading...'}
          sx={{ mt: 2 }}
        >
          Save
        </Button>
        {uploadStatus && (
          <p style={{ marginTop: '1rem', color: uploadStatus.includes('failed') ? 'red' : 'green' }}>
            {uploadStatus}
          </p>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <PreviewImageList files={files} setFiles={setFiles} />
      </Grid>
    </Grid>
  );
});

export default ImageUploadManager;