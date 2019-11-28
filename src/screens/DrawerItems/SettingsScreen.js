import React, { Component } from "react";
import { Text, View } from "react-native";
import AppHeader from "../../components/AppHeader";

export default class SettingsScreen extends Component {

  render() {
    return (
      <View>
        <AppHeader navigation={this.props.navigation} screenProps={this.props.screenProps} />
        <Text> SettingsScreen </Text>
      </View>
    )
  }
}
