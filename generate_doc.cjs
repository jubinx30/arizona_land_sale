const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  Header,
  Footer,
  convertInchesToTwip,
} = require('docx');

// Document Palette
const COLOR_PRIMARY = '19543E';     // Rich Arizona Green
const COLOR_SECONDARY = '8C4A27';   // High Desert Terracotta
const COLOR_DARK = '1C2826';        // Deep Slate Black
const COLOR_MUTED = '4A6058';       // Muted Forest Sage
const COLOR_BG_LIGHT = 'F4F8F5';    // Subtle Soft Tint
const COLOR_BORDER = 'C8D8D0';      // Soft Border
const COLOR_WHITE = 'FFFFFF';       // White
const FONT_FAMILY = 'Calibri';

// Helper for compact margins and clean typography
function createHeaderCard() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_PRIMARY },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 140 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 30, line: 220 },
                children: [
                  new TextRun({
                    text: 'ARIZONA LIFE HOMES & LAND',
                    font: FONT_FAMILY,
                    bold: true,
                    size: 26, // 13pt
                    color: COLOR_WHITE,
                    characterSpacing: 20,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 200 },
                children: [
                  new TextRun({
                    text: 'Client Feature Presentation & Comprehensive Platform Capabilities',
                    font: FONT_FAMILY,
                    bold: false,
                    size: 19, // 9.5pt
                    color: 'D5EADB',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: '124130', type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 20, line: 190 },
                children: [
                  new TextRun({
                    text: 'CLIENT OVERVIEW',
                    font: FONT_FAMILY,
                    bold: true,
                    size: 16, // 8pt
                    color: '9AE0BA',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0, line: 190 },
                children: [
                  new TextRun({
                    text: '2-Page Feature Brief',
                    font: FONT_FAMILY,
                    size: 16,
                    color: COLOR_WHITE,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createSectionBanner(title, pageNum = null) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0, line: 200 },
                children: [
                  new TextRun({
                    text: title.toUpperCase(),
                    font: FONT_FAMILY,
                    bold: true,
                    size: 19, // 9.5pt
                    color: COLOR_PRIMARY,
                    characterSpacing: 15,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createFeatureItem(featureName, description, iconSymbol = '▪') {
  return new Paragraph({
    spacing: { before: 35, after: 45, line: 215 },
    children: [
      new TextRun({
        text: `${iconSymbol}  ${featureName}: `,
        font: FONT_FAMILY,
        bold: true,
        size: 18, // 9pt
        color: COLOR_SECONDARY,
      }),
      new TextRun({
        text: description,
        font: FONT_FAMILY,
        size: 18, // 9pt
        color: COLOR_DARK,
      }),
    ],
  });
}

function createTwoColGrid(leftChildren, rightChildren) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: 60, right: 100 },
            children: leftChildren,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: 100, right: 60 },
            children: rightChildren,
          }),
        ],
      }),
    ],
  });
}

function createBoxedSummary(title, content) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 18, color: COLOR_PRIMARY },
      right: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'FAFCFA', type: ShadingType.CLEAR },
            margins: { top: 70, bottom: 70, left: 120, right: 120 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 25, line: 200 },
                children: [
                  new TextRun({
                    text: title,
                    font: FONT_FAMILY,
                    bold: true,
                    size: 19,
                    color: COLOR_PRIMARY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0, line: 210 },
                children: [
                  new TextRun({
                    text: content,
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLOR_DARK,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            color: COLOR_DARK,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.48),
              bottom: convertInchesToTwip(0.48),
              left: convertInchesToTwip(0.52),
              right: convertInchesToTwip(0.52),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Arizona Life Homes & Land | Client Feature Overview',
                    size: 15,
                    font: FONT_FAMILY,
                    color: COLOR_MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: { top: 60, bottom: 0, left: 40, right: 40 },
                        children: [
                          new Paragraph({
                            spacing: { before: 0, after: 0 },
                            children: [
                              new TextRun({
                                text: 'United Country Real Estate · Richard "Rick" Frank · Pearce, AZ · (520) 403-3903',
                                size: 15,
                                font: FONT_FAMILY,
                                color: COLOR_MUTED,
                              }),
                            ],
                          }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: { top: 60, bottom: 0, left: 40, right: 40 },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 0, after: 0 },
                            children: [
                              new TextRun({
                                text: 'Confidential & Proprietary',
                                size: 15,
                                font: FONT_FAMILY,
                                color: COLOR_MUTED,
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ==================== PAGE 1 ====================
          createHeaderCard(),

          new Paragraph({ spacing: { before: 60, after: 60 } }),

          createBoxedSummary(
            'Executive Product Summary & Value Proposition',
            'Arizona Life Homes & Land is an application designed specifically for rural property buyers, homesteaders, acreage investors, and ranch seekers across Southern Arizona (Cochise, Pima, Graham, and Santa Cruz counties). Built around client convenience, spatial intelligence, and instant broker connectivity, it simplifies high-desert land discovery into a fast, transparent, and engaging digital experience.'
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 1: Interactive Discovery & Spatial Search Experience'),

          createTwoColGrid(
            [
              createFeatureItem(
                'Visual Discovery Hub',
                'Curated featured listings with swipeable high-resolution photography, price tags, and direct access to top acreage parcels.'
              ),
              createFeatureItem(
                'Multi-Modal Search Modes',
                'Instantly switch between List View (informative summaries), Grid View (visual gallery), and Map View (geospatial browsing).'
              ),
              createFeatureItem(
                'Instant Universal Search',
                'Live keyword query matches properties in real-time across parcel titles, cities, counties, physical addresses, and MLS numbers.'
              ),
              createFeatureItem(
                'One-Tap Suggestion Tags',
                'Popular search chips (Benson, Willcox, Pearce, Cochise, Ranch) for rapid single-tap regional filtering.'
              ),
            ],
            [
              createFeatureItem(
                'Dynamic Map Canvas',
                'Full interactive map plotting properties with intuitive price badges ($k / $m markers) for rapid visual comparison.'
              ),
              createFeatureItem(
                '"Search This Area" Bounding',
                'Smart viewport boundary search automatically updates matching property counts as users pan and zoom across Arizona terrain.'
              ),
              createFeatureItem(
                'GPS "My Location" Pinpointing',
                'One-touch geolocation centers the map onto the buyer’s current coordinates to reveal immediate nearby land opportunities.'
              ),
              createFeatureItem(
                'Floating Parcel Preview Cards',
                'Tapping any map pin reveals an instant preview card with pricing, acreage, thumbnail, and quick-route to listing details.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 2: Precision Multi-Criteria Filtering System'),

          createTwoColGrid(
            [
              createFeatureItem(
                'Budget Range Selectors',
                'Granular minimum and maximum price thresholds ranging from affordable entry parcels under $50K up to $500K+ estate properties.'
              ),
              createFeatureItem(
                'Custom Acreage Ranges',
                'Dual-input boundary controls allowing buyers to specify exact acreage requirements from compact lots to 500+ acre ranches.'
              ),
              createFeatureItem(
                'Property Classifications',
                'Segment listings by high-desert parcels, buildable land, mountain retreats, equine acreage, and commercial highway frontage.'
              ),
            ],
            [
              createFeatureItem(
                'Geographic County & City Filters',
                'Direct filtering by key Southern Arizona counties (Cochise, Pima, Graham, Santa Cruz) and cities (Pearce, Benson, Willcox, etc.).'
              ),
              createFeatureItem(
                'Rural Lifestyle & Utility Toggles',
                'Single-tap switches for essential rural requirements: Private Wells, Horses Allowed, Mountain Views, Gated Ranches, and National Forest adjacency.'
              ),
              createFeatureItem(
                'Live Result Pre-Counter',
                'Dynamic "Show X places" action button displays exact matching property counts in real-time before applying criteria.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 3: Categorical & Regional Browse Engine'),

          new Paragraph({
            spacing: { before: 30, after: 40, line: 215 },
            children: [
              new TextRun({
                text: '▪  Multi-Dimensional Browse Hub: ',
                font: FONT_FAMILY,
                bold: true,
                size: 18,
                color: COLOR_SECONDARY,
              }),
              new TextRun({
                text: 'Prospective buyers can browse inventory through tailored pathways including Browse by Property Type (Desert, Mountain, Equine, Commercial), Browse by County, Browse by City, Browse by Price Bracket, and Browse by State, each displaying active inventory counts.',
                font: FONT_FAMILY,
                size: 18,
                color: COLOR_DARK,
              }),
            ],
          }),

          // ==================== PAGE BREAK ====================
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== PAGE 2 ====================
          createSectionBanner('Pillar 4: Deep Listing Intelligence & Verified Specifications'),

          createTwoColGrid(
            [
              createFeatureItem(
                'High-Resolution Photo Gallery',
                'Multi-image carousel with touch-friendly swipe gestures, index counters (e.g. 1/3), and full-screen lightbox viewer.'
              ),
              createFeatureItem(
                'Verified Listing Specifications',
                'Prominent display of official MLS listing numbers, verified boundary acreage, listing status (Active), and exact legal address.'
              ),
              createFeatureItem(
                'At-a-Glance "The Details" Matrix',
                'Structured quick-reference data cards highlighting property dimensions, category classification, county jurisdiction, and municipality.'
              ),
            ],
            [
              createFeatureItem(
                'Feature & Amenity Checklist',
                'Verified checklist verifying power availability, road access, well water holding tanks, zoning, and livestock allowances.'
              ),
              createFeatureItem(
                'In-Depth Narrative & Local Insights',
                'Comprehensive descriptions detailing terrain qualities, scenic backdrops (e.g., Chiricahua Mountains), and neighborhood atmosphere.'
              ),
              createFeatureItem(
                'Embedded Vicinity Map & Similar Properties',
                'Integrated local map canvas and curated "Similar Places" carousel to keep prospective buyers actively engaged.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 5: Financial Due Diligence & Buyer Shortlisting Tools'),

          createTwoColGrid(
            [
              createFeatureItem(
                'Interactive Mortgage Calculator',
                'Instant monthly payment estimator allowing buyers to model customizable down payments (10%–50%), interest rates, and loan terms (15, 20, 30 years).'
              ),
              createFeatureItem(
                'Personal "Saved Places" Shortlist',
                'One-tap favoriting heart icon across all listing cards, maps, and detail views, stored privately and securely on the user’s device.'
              ),
            ],
            [
              createFeatureItem(
                'Side-by-Side Property Comparison',
                'Direct 2-property comparison matrix evaluating Price, Total Acreage, Classification, County Location, MLS Number, and Feature Highlights.'
              ),
              createFeatureItem(
                'Touch-Gesture Shortlist Management',
                'Intuitive swipe-to-remove gesture support for streamlining the client’s shortlist on mobile devices.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 6: Direct Broker Access & Frictionless Lead Engagement'),

          createTwoColGrid(
            [
              createFeatureItem(
                'One-Tap Broker Inquiry Sheet',
                'Streamlined inquiry bottom sheet pre-addressed directly to local broker Richard "Rick" Frank for immediate question dispatch.'
              ),
              createFeatureItem(
                'Integrated Click-to-Call Dialing',
                'Direct one-touch phone initiation to the brokerage office or mobile line (+1 520-403-3903) for immediate assistance.'
              ),
              createFeatureItem(
                'Meeting & Tour Scheduling',
                'Direct CTA allowing buyers to request on-site showings, land walkthroughs, or office consultations.'
              ),
            ],
            [
              createFeatureItem(
                'Native Listing Sharing',
                'Integrated sharing module using system share sheets or instant clipboard links to share properties with family or partners.'
              ),
              createFeatureItem(
                'Local Office & Brokerage Dossier',
                'Physical office locator (Pearce, AZ), weekly business hours, email routing, and direct link to official United Country web resources.'
              ),
              createFeatureItem(
                'Comprehensive Contact & Legal Center',
                'Inquiry validation with explicit consent compliance, Equal Housing Opportunity disclosures, and Fair Housing statements.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 40 } }),

          createSectionBanner('Pillar 7: User Personalization, Notifications & Platform Polish'),

          createTwoColGrid(
            [
              createFeatureItem(
                'Client Account & Profile Hub',
                'Secure account sign-in and registration with credential remembering, profile avatars, and personalized session management.'
              ),
              createFeatureItem(
                'Real-Time Notification Center',
                'Dedicated alert tray with unread notification badge, alerting clients to new land listings, price adjustments, and market news.'
              ),
            ],
            [
              createFeatureItem(
                'Dual Day & Night Ambient Themes',
                'One-tap toggle between crisp Light Mode and eye-friendly Dark Mode with automatic system preference detection.'
              ),
              createFeatureItem(
                'Modern "Liquid Glass" Navigation Dock',
                'Ergonomic floating navigation bar with fluid active pill indicators, saved badges, and interactive dynamic island status indicator.'
              ),
            ]
          ),

          new Paragraph({ spacing: { before: 70, after: 30 } }),

          // Bottom Closing Card
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR },
                    margins: { top: 70, bottom: 70, left: 120, right: 120 },
                    children: [
                      new Paragraph({
                        spacing: { before: 0, after: 20, line: 190 },
                        children: [
                          new TextRun({
                            text: 'ARIZONA LIFE HOMES AND LAND  |  UNITED COUNTRY REAL ESTATE',
                            font: FONT_FAMILY,
                            bold: true,
                            size: 17,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 0, after: 0, line: 200 },
                        children: [
                          new TextRun({
                            text: 'Office: 225 N. Frontage Rd., Suite 107, Pearce, AZ 85625  ·  Broker: Richard "Rick" Frank  ·  Direct: (520) 403-3903\nWebsite: www.arizonahomesandlandsales.com  ·  Equal Housing Opportunity Brokerage',
                            font: FONT_FAMILY,
                            size: 15,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}

async function main() {
  const doc = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'Arizona_Life_Homes_and_Land_Feature_Overview.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document successfully generated at: ${outputPath}`);
  console.log(`File size: ${buffer.length} bytes`);
}

main().catch((err) => {
  console.error('Error generating document:', err);
  process.exit(1);
});
