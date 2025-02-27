/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'architecture',
    {
      type: 'category',
      label: 'Modules',
      items: [
        'modules/config',
        'modules/storage',
        'modules/audio',
        'modules/ui-factory',
        'modules/word-manager',
        'modules/drag-drop',
        'modules/game-controller',
      ],
    },
    'user-guide',
    'developer-guide',
  ],
};

module.exports = sidebars;