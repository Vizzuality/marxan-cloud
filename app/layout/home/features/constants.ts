import EXAMPLE_PLACEHOLDER_PNG from 'images/home-features/example-placeholder.png';
import EXAMPLE_PROJECT_PNG from 'images/home-features/example-project.png';

import ANALYZE_AND_REPORT_SVG from 'svgs/home/analyze-report.svg?sprite';
import CLOUD_STORAGE_SVG from 'svgs/home/cloud-storage.svg?sprite';
import COLLABORATE_SVG from 'svgs/home/collaborate.svg?sprite';
import DOWNLOAD_ANALYSIS_SVG from 'svgs/home/download-analysis.svg?sprite';
import IMPROVE_EFFICIENCY_SVG from 'svgs/home/improve-efficiency.svg?sprite';

export const FEATURES = [
  {
    id: 'improve-efficiency',
    name: 'Improve Efficiency',
    description: 'Faster planning due to cloud computing, automatic geo-processing of spatial data and custom workflows.',
    icon: IMPROVE_EFFICIENCY_SVG,
  },
  {
    id: 'analyze-report',
    name: 'Analyze and Report',
    description: 'Easily create and explore multiple scenarios, generate gap analyses, compare solutions and download project summaries, maps and figures.',
    icon: ANALYZE_AND_REPORT_SVG,
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Hassle-free storage of planning projects, upload and secure important datasets for private use with your teams and access hosted datasets.',
    icon: CLOUD_STORAGE_SVG,
  },
  {
    id: 'collaborate',
    name: 'Collaborate and Manage Teams',
    description: 'Sharing a project is easier than ever! Invite collaborators to view, edit, and co-develop projects with your team. Improve transparency in real-time planning meetings, invite stakeholders and assign roles to contributors.',
    icon: COLLABORATE_SVG,
  },
  {
    id: 'centralize-planning',
    name: 'Centralize Planning and Share',
    description: 'Create a central repository for your existing and new Marxan projects, update analyses as new data emerges and adapt as planning priorities change. Share your projects with the growing global Marxan community!',
    icon: DOWNLOAD_ANALYSIS_SVG,
  },
];

export const EXAMPLE_PROJECTS = [
  {
    id: 'project-placeholder-01',
    alt: '',
    image: EXAMPLE_PLACEHOLDER_PNG,
  },
  {
    id: 'project-placeholder-02',
    alt: '',
    image: EXAMPLE_PLACEHOLDER_PNG,
  },
  {
    id: 'project-placeholder-03',
    alt: '',
    image: EXAMPLE_PLACEHOLDER_PNG,
  },
  {
    id: 'project-kenya',
    alt: 'Project Kenya features example',
    image: EXAMPLE_PROJECT_PNG,
  },
];
