/* eslint-disable prettier/prettier */
import {StyleSheet } from 'react-native';
import { horizontalScale, verticalScale } from '../../utils/Metrics';
import COLORS from '../../utils/Colors';

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.container,
    padding: 10
  },

  headr: {
    backgroundColor: "#E9F1FF",
    marginTop: 23,
    height: "10%",
    width: "100%",
    justifyContent: 'center',
  },
  header2: {
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row'
  },
  clockcont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13
  },
  clock: {
    height: 60,
    width: 60,
  },
  heading: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignSelf: 'center',
    color: "#0C5EBD",
  },
  card: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardimg: {
    height: 55,
    width: 55,
    borderRadius: 12,
  },
  cardRight: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appname: {
    fontSize: 13,
    fontWeight: '700',
    color: '#002055',
  },
  timeTag: {
    backgroundColor: COLORS.background1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeTagText: {
    color: '#002055',
    fontWeight: '600',
    fontSize: 12,
  },
  percentageText: {
    color: '#002055',
    fontSize: 13,
    fontWeight: '600',
    marginVertical: verticalScale(4),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: "#002055"
  },
  permissionButton: {
    backgroundColor: COLORS.btnbg,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
   timeRangeToggle: {
    backgroundColor: COLORS.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 10,
  },
  timeRangeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabButton: {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginHorizontal: 5,
  backgroundColor: COLORS.background1,


  alignItems: 'center',
},
activeTabButton: {
  backgroundColor: COLORS.blue,

},
tabButtonText: {
  color: COLORS.white,
  fontSize: 16,
  fontWeight: '600',
},
activeTabButtonText: {
  color: 'white',
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 100,
},
emptyText: {
  fontSize: 16,
  color: COLORS.blue,
  textAlign: 'center',
},
countText: {
  fontSize: 12,
  color: COLORS.blue,
  marginLeft: 8,
},
othersCard: {
  backgroundColor: COLORS.white,
  borderLeftColor: COLORS.checkbox,
  borderLeftWidth: 4,
},

otherAppCard: {
  marginLeft: 20,
  opacity: 0.9,
  backgroundColor: COLORS.white
},

toggleText: {
  fontSize: 12,
  color: COLORS.blue,
  marginLeft: 8,
  fontWeight: '500',
},
syncButton: {
    backgroundColor: COLORS.blue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  syncButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },

  syncIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },



});
export default styles;
