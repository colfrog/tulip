import { useState } from 'react';

function ImageOverlay({src, alt, onClick}) {
    return (
        <div id="image-overlay" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            position: "fixed",
            top: "0px",
            left: "0px",
            height: "100vh",
            width: "100vw"
        }} onClick={onClick}>
          <img style={{
              maxWidth: "95%",
              maxHeight: "95%"
          }} src={src} alt={alt} />
        </div>
    );
}

export function Image({style, src, alt}) {
    let [showOverlay, setShowOverlay] = useState(false);
    let enableOverlay = () => setShowOverlay(true);
    let disableOverlay = () => setShowOverlay(false);
    let overlay = null;
    if (showOverlay)
        overlay = <ImageOverlay src={src} alt={alt} onClick={disableOverlay} />;

    return (
        <>
          <img style={style} src={src} alt={alt} onClick={enableOverlay} />
          {overlay}
        </>
    );
}
