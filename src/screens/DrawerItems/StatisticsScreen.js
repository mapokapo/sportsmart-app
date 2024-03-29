import React, { Component } from "react";
import { Text, View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, ToastAndroid, RefreshControl } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import { LineChart } from "react-native-chart-kit";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Icon } from "react-native-elements";

const screenWidth = Dimensions.get("window").width;

export default class StatisticsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loaded: false,
      items: [
        {
          title: props.screenProps.currentLang.labels.activity,
          suffix: "kJ",
          main: true,
          data: {
            labels: [],
            datasets: [
              {
                data: []
              }
            ]
          }
        },
        {
          title: props.screenProps.currentLang.labels.calories,
          suffix: "kCal",
          data: {
            labels: [],
            datasets: [
              {
                data: []
              }
            ]
          }
        },
        {
          title: props.screenProps.currentLang.labels.distance,
          suffix: "km",
          data: {
            labels: [],
            datasets: [
              {
                data: []
              }
            ]
          }
        },
        {
          title: props.screenProps.currentLang.labels.duration,
          suffix: "s",
          data: {
            labels: [],
            datasets: [
              {
                data: []
              }
            ]
          }
        },
        {
          title: props.screenProps.currentLang.labels.speed,
          suffix: "m/s",
          data: {
            labels: [],
            datasets: [
              {
                data: []
              }
            ]
          }
        }
      ]
    };
  }

  componentDidMount = () => {
    this.refreshInfo();
  }

  refreshInfo = () => {
    this.setState({ loading: true, loaded: false }, () => {
      this.unsubscribe = auth().onAuthStateChanged(user => {
        if (user) {
          firestore().collection("users").doc(user.uid).get().then(doc => {
            if (!doc.exists) {
              ToastAndroid.show(this.props.screenProps.currentLang.errors.unhandledError + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.LONG);
              this.setState({ loading: false, loaded: false });
              return;
            }
            if (!doc.data().data) {
              this.setState({ loading: false, loaded: false });
              return;
            }
            const data = doc.data().data;
            const unit = doc.data().unit;
            let items = this.state.items;
            // Activity, Calories, Distance, Duration, Speed
            items[0].data.datasets[0].data = data.map(({ kjoules }) => kjoules);
            items[0].data.labels = data.map(obj => {
              return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
            });
            items[1].data.datasets[0].data = data.map(({ kcal }) => unit === "metric" ? kcal : kcal/1000);
            items[1].data.labels = data.map(obj => {
              return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
            });
            items[1].suffix = unit === "metric" ? "kCal" : "Cal";
            items[2].data.datasets[0].data = data.map(({ distance }) => unit === "metric" ? distance : (Math.round( (distance * 0.62137119) * 100 + Number.EPSILON) / 100));
            items[2].data.labels = data.map(obj => {
              return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
            });
            items[2].suffix = unit === "metric" ? "km" : "mi";
            items[3].data.datasets[0].data = data.map(({ duration }) => duration);
            items[3].data.labels = data.map(obj => {
              return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
            });
            items[4].data.datasets[0].data = data.map(({ distance, duration }) => Math.round( (((distance * 1000)/duration) * (unit === "metric" ? 1 : 3.28084)) * 100 + Number.EPSILON) / 100);
            items[4].data.labels = data.map(obj => {
              return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
            });
            items[4].suffix = unit === "metric" ? "m/s" : "ft/s";
            this.setState({ loading: false, loaded: true });
          });
        } else {
          ToastAndroid.show(this.props.screenProps.currentLang.errors.unhandledError + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.LONG);
          this.setState({ loading: false, loaded: false });
        }
      });
    });
  }

  componentWillUnmount = () => {
    if (this.unsubscribe) this.unsubscribe();
  }

  renderItem = ({ item, index }) => {
    return <View key={index.toString()} style={{ width: item.main ? screenWidth : screenWidth/2, justifyContent: "center", alignItems: "center", marginVertical: 5 }}>
      <Text style={styles.title}>{item.title}</Text>
      <LineChart
        yLabelsOffset={2}
        data={item.data}
        width={item.main ? screenWidth - 3 : screenWidth/2 - 3}
        height={item.main ? 220 : 110}
        yAxisSuffix={item.suffix}
        style={{ borderRadius: 10 }}
        getDotProps={(data, index) => {
          return {
            r: 5,
            fill: index === 4 ? "rgba(243, 54, 54, 1)" : "rgba(216, 232, 240, 0.85)"
          };
        }}
        chartConfig={{
          backgroundGradientFrom: colors.dark,
          backgroundGradientFromOpacity: item.main ? 1 : 0.85,
          backgroundGradientTo: item.main ? colors.dark : colors.blue,
          backgroundGradientToOpacity: 1,
          color: (opacity = 1) => `rgba(216, 232, 240, ${opacity})`
        }}
      />
    </View>
  }
  
  render() {
    return (
      <View style={styles.mainWrapper}>
        <AppHeader navigation={this.props.navigation} screenProps={this.props.screenProps} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          {!this.state.loading && this.state.loaded ? (<ScrollView
            refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.refreshInfo} />}
            contentContainerStyle={{ justifyContent: "center", flexGrow: 1, flexDirection: "row", flexWrap: "wrap" }}
          >
            {this.state.items.map((item, index) => this.renderItem({item, index}))}
          </ScrollView>) : (!this.state.loading && !this.state.loaded  ?
            (
              <View style={{ elevation: 2, flexDirection: "row", opacity: 0.75, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ textAlign: "center", fontSize: 20, color: colors.dark }}>{this.props.screenProps.currentLang.labels.noData1}</Text><Icon color={colors.dark} size={24} type="material-community" name="run" /><Text style={{ textAlign: "center", fontSize: 20, color: colors.dark }}>{this.props.screenProps.currentLang.labels.noData2}</Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color={colors.dark} />
            )
          )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.light
  },
  title: {
    textAlign: "center",
    color: colors.dark,
    fontSize: 30,
    marginTop: 5
  }
});