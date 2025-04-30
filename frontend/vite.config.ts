import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Implement manual chunking to optimize bundle splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React and routing
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-helmet-async')
            ) {
              return 'vendor-react';
            }
        
            // MUI and styling
            if (
              id.includes('@mui') ||
              id.includes('@emotion') ||
              id.includes('styled-components') ||
              id.includes('clsx') ||
              id.includes('tailwind') ||
              id.includes('postcss')
            ) {
              return 'vendor-ui';
            }
        
            // Charts and maps
            if (
              id.includes('apexcharts') ||
              id.includes('react-apexcharts') ||
              id.includes('swiper') ||
              id.includes('leaflet') ||
              id.includes('react-leaflet') ||
              id.includes('flatpickr')
            ) {
              return 'vendor-visuals';
            }
        
            // FullCalendar
            if (id.includes('@fullcalendar')) {
              return 'vendor-calendar';
            }
        
            // AWS SDK
            if (id.includes('@aws-sdk')) {
              return 'vendor-aws';
            }
        
            // Auth & security
            if (
              id.includes('jwt-decode') ||
              id.includes('@react-oauth/google')
            ) {
              return 'vendor-auth';
            }
        
            // Utility libraries
            if (
              id.includes('axios') ||
              id.includes('date-fns') ||
              id.includes('uuid')
            ) {
              return 'vendor-utils';
            }
        
            // Drag-and-drop
            if (
              id.includes('react-dnd') ||
              id.includes('dnd-core')
            ) {
              return 'vendor-dnd';
            }
        
            // Others
            return 'vendor-other';
          }
        
          // Optional: Feature or module-based chunking
          if (id.includes('/src/features/') || id.includes('/src/modules/')) {
            const match = id.match(/src\/(features|modules)\/([^/]+)/);
            if (match) {
              return `feature-${match[2]}`;
            }
          }
        
          if (id.includes('/src/pages/')) return 'pages';
          if (id.includes('/src/components/')) return 'components';
        
          return undefined;
        },
        // Enable minification of internal exports for better optimization
        minifyInternalExports: true
      }
    }
  }
});