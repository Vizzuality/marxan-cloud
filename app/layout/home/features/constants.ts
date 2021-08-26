import ANALYZE_AND_REPORT_SVG from 'svgs/home/analyze-report.svg?sprite';
import CLOUD_STORAGE_SVG from 'svgs/home/cloud-storage.svg?sprite';
import COLLABORATE_SVG from 'svgs/home/collaborate.svg?sprite';
import DOWNLOAD_ANALYSIS_SVG from 'svgs/home/download-analysis.svg?sprite';
import IMPROVE_EFFICIENCY_SVG from 'svgs/home/improve-efficiency.svg?sprite';

export const FEATURES = [
  {
    id: 'improve-efficiency',
    name: 'Improve Efficiency',
    description: 'Significant efficiency gains due to the intuitive interface, improved workflow, and collaboration options.',
    icon: IMPROVE_EFFICIENCY_SVG,
    iconClassName: 'w-6 h-6 text-primary-500',
  },
  {
    id: 'analyze-report',
    name: 'Analyze and Report',
    description: 'Entire workflow at your fingertips: automatic creation of planning units, preprocessing of spatial data, automated parameter calibration and troubleshooting, Marxan analysis is run on the cloud, simple visualisation of results and analytics.',
    icon: ANALYZE_AND_REPORT_SVG,
    iconClassName: 'w-6 h-6 text-primary-500 stroke-current',
  },
  {
    id: 'cloud-storage',
    name: 'Cloud storage',
    description: 'Hassle-free storage and data sharing. All data uploaded by a user is secured in the cloud and accessible to selected collaborators.',
    icon: CLOUD_STORAGE_SVG,
    iconClassName: 'w-6 h-6 text-primary-500',
  },
  {
    id: 'collaborate',
    name: 'Collaborate and Manage Teams',
    description: 'Sharing a project is easier than ever! Collaborators can view, edit and comment on projects, improving the transparency and collaborative nature of conservation planning.',
    icon: COLLABORATE_SVG,
    iconClassName: 'w-6 h-6 text-primary-500',
  },
  {
    id: 'download-analysis',
    name: 'Download analysis',
    description: 'Download summary reports, figures, and analytics, as well as whole projects or specific scenarios in formats compatible with other Marxan softwares and companion tools.',
    icon: DOWNLOAD_ANALYSIS_SVG,
    iconClassName: 'w-6 h-6 text-primary-500',
  },
];
