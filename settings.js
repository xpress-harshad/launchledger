export const branding = {
  name: 'LaunchLedger',
  studio: 'Kalpa Octant'
};

export const phases = ['Before launch', 'Launch day', 'Client handover'];

const common = [
  ['Before launch', 'Verify contact and booking flows', 'Send a test inquiry and confirm it arrives at the right inbox.', true],
  ['Before launch', 'Check mobile layouts and keyboard access', 'Walk through the key pages and forms on a phone and with the keyboard.', false],
  ['Before launch', 'Save a recovery copy', 'Confirm where the backup lives and who can restore it.', true],
  ['Launch day', 'Verify domain and HTTPS', 'Check the preferred URL, redirects, and secure connection from a separate device.', true],
  ['Launch day', 'Review indexing settings', 'Check that the live site is indexable and staging stays out of search.', false],
  ['Client handover', 'Confirm account ownership', 'Verify the client can access their hosting and domain accounts. Record ownership only.', true],
  ['Client handover', 'Share the maintenance plan', 'Document renewal dates, routine updates, and the support contact.', false]
];

export const presets = {
  'New website': common,
  'Website migration': [
    ['Before launch', 'Map old URLs to new pages', 'Record the redirect map for pages that already receive traffic.', true],
    ...common,
    ['Launch day', 'Verify redirects from the old site', 'Test a sample of high-traffic URLs against the redirect map.', true],
    ['Launch day', 'Confirm inbound email still works', 'Send and receive a test email after any DNS change.', true]
  ],
  'Online store': [
    ...common,
    ['Before launch', 'Complete a test order', 'Verify payment, shipping charges, receipt, and refund in the appropriate test environment.', true],
    ['Launch day', 'Verify the live checkout configuration', 'Confirm the correct payment environment and currency before taking orders.', true],
    ['Client handover', 'Walk through order fulfilment', 'Show the client how to fulfil orders, handle returns, and update stock.', false]
  ]
};
