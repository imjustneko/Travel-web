
import { useState } from 'react';
import Lightbox from 'react-image-lightbox';

function Gallery() {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="gallery-grid">
      {images.map((img, index) => (
        <img 
          key={index}
          src={img}
          onClick={() => {
            setPhotoIndex(index);
            setIsOpen(true);
          }}
        />
      ))}
      
      {isOpen && (
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}