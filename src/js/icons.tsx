import React from 'react';

/* All icons Material Design icons by Google
 * Licensed under Apache License Version 2.0
 * https://github.com/google/material-design-icons
 */

const Close = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const ArrowForward = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
  </svg>
);

const Check = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const Info = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const ReturnKey = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height="24"
    width="24"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z" />
  </svg>
);

const Delete = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const Plus = (
  <svg
    className="svg-icon"
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

export default {
  ArrowForward,
  Close,
  Check,
  Info,
  ReturnKey,
  Delete,
  Plus,
};
