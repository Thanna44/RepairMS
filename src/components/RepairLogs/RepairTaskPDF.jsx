import {
  Font,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import SarabunRegular from "../../Font/Sarabun/Sarabun-Regular.ttf";
import SarabunBold from "../../Font/Sarabun/Sarabun-Bold.ttf";

// Register Sarabun font
Font.register({
  family: "Sarabun",
  fonts: [
    { src: SarabunRegular, fontWeight: "normal" },
    { src: SarabunBold, fontWeight: "bold" },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Sarabun",
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  sparePartsTable: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
  },
});

// Create Document Component
const RepairTaskPDF = ({ data, users }) => {
  const assignedUser = users.find((user) => user.id === data.assigned_user_id);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Spare parts withdrawal form</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <Text style={styles.text}>Device Name: {data.device_name}</Text>
          <Text style={styles.text}>Issue: {data.issue}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          <Text style={styles.text}>Status: {data.status}</Text>
          <Text style={styles.text}>Priority: {data.priority}</Text>
          <Text style={styles.text}>
            Assigned To: {assignedUser ? assignedUser.full_name : "Unassigned"}
          </Text>
        </View>

        {data.spare_parts && data.spare_parts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spare Parts</Text>
            <View style={styles.sparePartsTable}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Part Name</Text>
                <Text style={styles.tableCell}>Part Number</Text>
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              {data.spare_parts.map((part, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{part.name}</Text>
                  <Text style={styles.tableCell}>{part.part_number}</Text>
                  <Text style={styles.tableCell}>{part.quantity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default RepairTaskPDF;
