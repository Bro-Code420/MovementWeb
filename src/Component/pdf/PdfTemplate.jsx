



import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ======================================================
// MOVEMENT REHAB — PREMIUM CLINICAL STATIONERY
// ======================================================

const BLUE = "#0B4BAA";
const CYAN = "#00C2CB";
const NAVY = "#092A59";
const INK = "#14302E";
const MUTED = "#5F7573";
const LINE = "#DCE6E4";
const HEAD = "#E8F0FB";
const WHITE = "#FFFFFF";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  // PAGE
  page: {
    backgroundColor: WHITE,
    color: INK,
    fontFamily: "Roboto",
    fontSize: 9,
    paddingTop: 142,
    paddingBottom: 112,
    paddingHorizontal: 43,
  },

  // Brand accent
  topNavy: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: NAVY,
  },

  topCyan: {
    position: "absolute",
    top: 7,
    left: 0,
    width: 105,
    height: 3,
    backgroundColor: CYAN,
  },

  // LETTERHEAD
  header: {
    position: "absolute",
    top: 24,
    left: 43,
    right: 43,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 81,
    paddingBottom: 14,
  },

  brandColumn: {
    width: "39%",
    justifyContent: "center",
  },

  logo: {
    width: 145,
    height: 66,
    objectFit: "contain",
  },

  brandCaption: {
    fontSize: 6.5,
    color: MUTED,
    letterSpacing: 1.1,
    marginTop: 4,
  },

  doctorColumn: {
    width: "59%",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  credentialsLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    color: BLUE,
    letterSpacing: 1,
    marginBottom: 6,
  },

  doctorName: {
    fontSize: 12,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 5,
    textAlign: "right",
  },

  doctorDetail: {
    fontSize: 7,
    lineHeight: 1.55,
    color: MUTED,
    textAlign: "right",
  },

  registration: {
    fontSize: 6.5,
    color: BLUE,
    marginTop: 5,
    textAlign: "right",
  },

  headerRule: {
    height: 1,
    backgroundColor: LINE,
  },

  headerRuleAccent: {
    width: 65,
    height: 2,
    backgroundColor: CYAN,
  },

  // CONTENT
  content: {
    flexGrow: 1,
    width: "100%",
  },

  // Optional styles for existing child components
  documentEyebrow: {
    fontSize: 7,
    fontWeight: 700,
    color: BLUE,
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  documentTitle: {
    fontSize: 21,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 7,
  },

  documentSubtitle: {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: 1.6,
    marginBottom: 15,
  },

  sectionHeading: {
    fontSize: 10,
    fontWeight: 700,
    color: NAVY,
    backgroundColor: HEAD,
    borderLeftWidth: 3,
    borderLeftColor: CYAN,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 12,
    marginBottom: 8,
  },

  bodyText: {
    fontSize: 9,
    lineHeight: 1.7,
    color: INK,
    marginBottom: 6,
  },

  // SIGNATURE
  signature: {
    position: "absolute",
    bottom: 82,
    right: 43,
    width: 180,
    alignItems: "flex-end",
  },

  signatureAccent: {
    width: 35,
    height: 3,
    backgroundColor: CYAN,
    marginBottom: 8,
  },

  signatureLine: {
    width: 150,
    borderTopWidth: 0.8,
    borderTopColor: LINE,
    marginBottom: 7,
  },

  signatureLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 1,
    marginBottom: 5,
  },

  signatureName: {
    fontSize: 9,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 3,
  },

  signatureRole: {
    fontSize: 7,
    color: MUTED,
  },

  // FOOTER
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: NAVY,
    paddingHorizontal: 43,
    paddingTop: 11,
    paddingBottom: 9,
  },

  footerAccent: {
    position: "absolute",
    top: 0,
    left: 43,
    width: 45,
    height: 3,
    backgroundColor: CYAN,
  },

  footerMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  footerLeft: {
    width: "62%",
  },

  footerRight: {
    width: "36%",
    alignItems: "flex-end",
  },

  footerBrand: {
    fontSize: 9,
    fontWeight: 700,
    color: WHITE,
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  footerAddress: {
    fontSize: 6.5,
    color: "#C8D8ED",
    lineHeight: 1.5,
  },

  footerContact: {
    fontSize: 7,
    color: WHITE,
    marginBottom: 5,
    textAlign: "right",
  },

  footerEmail: {
    fontSize: 6.5,
    color: "#C8D8ED",
    textAlign: "right",
  },

  footerBottom: {
    borderTopWidth: 0.5,
    borderTopColor: "#355174",
    marginTop: 8,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerTagline: {
    fontSize: 6,
    color: CYAN,
    letterSpacing: 0.6,
  },

  pageNumber: {
    fontSize: 6.5,
    color: WHITE,
  },
});

const PdfTemplate = ({
  children,
  showHeader = true,
  showSignature = true,
}) => {
  return (
    <Document
      title="Movement Rehab Center LLP"

    >
      <Page size="A4" style={styles.page} wrap>
        {/* Page identity */}
        <View style={styles.topNavy} fixed />
        <View style={styles.topCyan} fixed />

        {/* Professional letterhead */}
        <View style={styles.header} fixed>
          <View style={styles.headerRow}>
            <View style={styles.brandColumn}>
              <Image
                src="/logo2.jpeg"
                style={styles.logo}
              />

              <Text style={styles.brandCaption}>
                PHYSIOTHERAPY & REHABILITATION
              </Text>
            </View>

          </View>

          <View style={styles.headerRule} />
          <View style={styles.headerRuleAccent} />
        </View>

        {/* Existing document content — unchanged */}
        <View style={styles.content}>
          {children}
        </View>

        {/* Signature */}
        {showSignature && (
          <View style={styles.signature} fixed>
            <View style={styles.signatureAccent} />

            <View style={styles.signatureLine} />

            <Text style={styles.signatureLabel}>
              AUTHORIZED SIGNATURE
            </Text>

            <Text style={styles.signatureName}>
              Dr. Mayank Gupta (PT)
            </Text>

            <Text style={styles.signatureRole}>
              Physiotherapist
            </Text>
          </View>
        )}

        {/* Premium clinic footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerAccent} />

          <View style={styles.footerMain}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerBrand}>
                MOVEMENT REHAB Center LLP
              </Text>

              <Text style={styles.footerAddress}>
                Akhand Param Dham, Near NDP's School
              </Text>

              <Text style={styles.footerAddress}>
                Khandwa Road, Indore, Madhya Pradesh - 452020
              </Text>
            </View>

            <View style={styles.footerRight}>
              <Text style={styles.footerContact}>
                +91 6262 666 558
              </Text>

              <Text style={styles.footerEmail}>
                movementrehab.help@gmail.com
              </Text>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerTagline}>
              MOVE BETTER. LIVE BETTER.
            </Text>

            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `PAGE ${pageNumber} OF ${totalPages}`
              }
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PdfTemplate;
export { styles as pdfStyles };
