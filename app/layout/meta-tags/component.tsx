import React from 'react';

export interface MetaTagsProps {
  name: string,
  title: string,
  description: string,
  url?: string,
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

export const MetaTags: React.FC<MetaTagsProps> = ({
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
      <meta property="og:site_name" content={name} key="name" />
      <meta property="og:title" content={title} key="title" />
      <meta property="og:description" content={description} key="description" />
      <meta property="og:url" content={url} key="url" />
      <meta property="og:type" content={type} key="type" />
      <meta property="article:publisher" content={publisher} key="publisher" />
      <meta property="article:section" content={section} key="section" />
      <meta property="article:tag" content={tag} key="tag" />
      <meta property="og:image" content={image} key="image" />
      <meta property="og:image:secure_url" content={imageURL} key="imageURL" />
      <meta property="og:image:width" content={imageWidth} key="imageWidth" />
      <meta property="og:image:height" content={imageHeight} key="imageHeight" />
      <meta property="twitter:card" content={twitterCard} key="twitterCard" />
      <meta property="twitter:image" content={twitterImage} key="twitterImage" />
      <meta property="twitter:site" content={twitterSite} key="twitterSite" />
    </>
  );
};

export default MetaTags;
