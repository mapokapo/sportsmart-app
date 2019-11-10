import React, { Component } from "react";
import { Text, View } from "react-native";
import AppHeader from "../../components/AppHeader";

export default class TogetherScreen extends Component {
  render() {
    return (
      <View>
        <AppHeader navigation={this.props.navigation} />
        <Text> TogetherScreen </Text>
      </View>
    )
  }
}
