import React from 'react';
import Head from 'next/head';

export interface MetaTagsProps {
  name: string,
  title: string,
  description: string,
  url?: string,
  type: string,
  publisher?: string,
  section?: string,
  tag?: string,
  image: string,
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
    <Head>
      {name && <meta name="og:site_name" content={name} key="name" />}
      {title && <meta name="og:title" content={title} key="title" />}
      {description && <meta name="og:description" content={description} key="description" />}
      {url && <meta name="og:url" content={url} key="url" />}
      {type && <meta name="og:type" content={type} key="type" />}
      {publisher && <meta name="article:publisher" content={publisher} key="publisher" />}
      {section && <meta name="article:section" content={section} key="section" />}
      {tag && <meta name="article:tag" content={tag} key="tag" />}
      {image && <meta name="og:image" content={image} key="image" />}
      {imageURL && <meta name="og:image:secure_url" content={imageURL} key="imageURL" />}
      {imageWidth && <meta name="og:image:width" content={imageWidth} key="imageWidth" />}
      {imageHeight && <meta name="og:image:height" content={imageHeight} key="imageHeight" />}
      {twitterCard && <meta name="twitter:card" content={twitterCard} key="twitterCard" />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} key="twitterImage" />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} key="twitterSite" />}
    </Head>
  );
};

export default MetaTags;
