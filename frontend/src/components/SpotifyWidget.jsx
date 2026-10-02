import React from "react";

const FullSpotifyWidget = ({ className = "" }) => {
  return (
    <div className={`spotify-widget ${className}`}>
      <iframe
        src="https://open.spotify.com/embed/playlist/4NIGQ58FCcrlRVSgiqIeqh"
        width="100%"
        height="400"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Playlist"
      ></iframe>
    </div>
  );
};

export default FullSpotifyWidget;