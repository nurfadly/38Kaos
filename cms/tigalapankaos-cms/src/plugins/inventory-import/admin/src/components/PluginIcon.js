import React from 'react';

// Ikon sederhana (kotak/box) - dibuat sendiri lewat SVG inline supaya tidak
// bergantung pada package @strapi/icons (menghindari risiko versi/dependency).
export default function PluginIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
