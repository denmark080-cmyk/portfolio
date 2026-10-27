import React from 'react';

export default function CenterPortrait() {
  return (
    <div className="center-sticky-column">
      <div className="profile-hero-center">
        {/* Cutout portrait centered with soft fade mask at bottom (no halo circle behind profile) */}
        <img
          className="center-portrait-img"
          src="/photo/profile1.png"
          alt="Denmark N. Catolico"
        />
      </div>
    </div>
  );
}

