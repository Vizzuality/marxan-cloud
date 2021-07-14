import React from 'react';

export interface MetaTagsProps {
  name: string,
  title: string,
  description: string,
  url: string,
  type: string,
  publisher?: string,
  section?: string,
  tag?: string,
  image?: string,
  imageURL?: string,
  imageWidth?: string,
  imageHeight?: string,
  twitterCard?: string,
  twitterImage?: string,
  twitterSite?: string,
}

export const Backlink: React.FC<MetaTagsProps> = ({
  name,
  title,
  description,
  url,
  type,
  publisher,
  section,
  tag,
  image,
  imageURL,
  imageWidth,
  imageHeight,
  twitterCard,
  twitterImage,
  twitterSite,
}: MetaTagsProps) => {
  return (
    <>
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="article:publisher" content={publisher} />
      <meta property="article:section" content={section} />
      <meta property="article:tag" content={tag} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={imageURL} />
      <meta property="og:image:width" content={imageWidth} />
      <meta property="og:image:height" content={imageHeight} />
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:image" content={twitterImage} />
      <meta property="twitter:site" content={twitterSite} />
    </>
  );
};

export default Backlink;
