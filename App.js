import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  DrawerNavigator,
  StackNavigator,
  TabNavigator,
  TabBarTop,
  TabBarBottom,
  withNavigation
} from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStore, combineReducers } from 'redux';
import { connect, Provider } from 'react-redux';

const initialState = {
  tabs: ['TabTwoA', 'TabTwoB']
};

const tabsReducer = (state = initialState, action) => {
  return state;
};

const store = createStore(
  combineReducers({
    tabs: tabsReducer
  })
);

const Home = () => (
  <View style={styles.container}>
    <Text>Open up App.js to start working on your app!</Text>
    <Text>Changes you make will automatically reload.</Text>
    <Text>Shake your phone to open the developer menu.</Text>
  </View>
);

const TabOne = () => (
  <View style={styles.container}>
    <Text>Tab One - I should have a clone icon!</Text>
  </View>
);

TabOne.navigationOptions = ({ navigation }) => ({
  headerRight: <Icon name="clone" size={20} />
});

const TabTwo = () => (
  <View style={styles.container}>
    <Text>Tab Two</Text>
  </View>
);

const TabTwoA = () => (
  <View style={styles.container}>
    <Text>Tab Two A - I should have an '@' sign.</Text>
  </View>
);

TabTwoA.navigationOptions = ({ navigation }) => ({
  headerRight: <Icon name="at" size={20} />
});

const TabTwoB = props => {
  return (
    <View style={styles.container}>
      <Text>Tab Two B - I should have a bug icon!</Text>
    </View>
  );
};

TabTwoB.navigationOptions = ({ navigation }) => ({
  headerRight: <Icon name="bug" size={20} />
});

// helper method to create a stack navigator for top-level screens to keep the same
// header on all pages yet still use the drawer for page lists.
const createStackNavigator = (key, screen) => {
  const routes = {};
  routes[key] = {
    screen
  };

  return StackNavigator(routes, {
    navigationOptions: ({ navigation }) => {
      const onPress = () => {
        navigation.navigate('DrawerToggle');
      };

      return {
        headerLeft: (
          <TouchableOpacity onPress={onPress} style={{ padding: 12 }}>
            <Icon name="bars" size={20} />
          </TouchableOpacity>
        ),
        title: key
      };
    }
  });
};

// map of components used to dymanically create the tab screens.
const TabComponents = {
  TabTwoA,
  TabTwoB
};

// functional component connected to redux store to dynamically create tab routes.
const CustomTabNavigators = props => {
  const tabTwoRoutes = props.tabs.reduce((carry, tab) => {
    carry[tab] = {
      screen: TabComponents[tab]
    };
    return carry;
  }, {});

  const TheTabNavigator = TabNavigator(
    {
      TabOne: {
        navigationOptions: {
          tabBarIcon: ({ tintColor }) => (
            <Icon name="calendar" size={20} color={tintColor} />
          )
        },
        screen: TabOne
      },
      TabTwo: {
        navigationOptions: {
          tabBarIcon: ({ tintColor }) => (
            <Icon name="th-large" size={20} color={tintColor} />
          )
        },
        screen: TabNavigator(tabTwoRoutes, {
          animationEnabled: true,
          swipeEnabled: true,
          tabBarComponent: TabBarTop,
          tabBarPosition: 'top'
        })
      }
    },
    {
      animationEnabled: true,
      swipeEnabled: true,
      showIcon: true,
      tabBarComponent: TabBarBottom,
      tabBarPosition: 'bottom'
    }
  );

  /**
   * ATTEMPT ONE:
   *
   * When returning the component the tabs technically work, BUT the headerLeft element from TabTwoA's
   * or TabTwoB's navigationOptions is ignore and never shown. The icons are important, because each
   * tab will have a different icon linked to a different dispatched action.
   */
  return <TheTabNavigator />;

  /**
   * ATTEMPT TWO
   *
   * When attempting to pass the navigation prop, I get a TypeError because line 46 of withCachedChildNavigation
   * is expecting an array of routes, but none are available in this navigation prop.
   *
   * TypeError: TypeError: Cannot read property 'forEach' of undefined
   * This error is located at:
   *   in withCachedChildNavigation(TabView) (at TabNavigator.js:34)
   */
  return <TheTabNavigator navigation={props.navigation} />;
};

const mapStateToProps = state => ({
  tabs: state.tabs.tabs
});

const ConnectedTabNavigators = connect(mapStateToProps)(CustomTabNavigators);

// Drawer navigator for all screens.
const DrawerStack = DrawerNavigator({
  Home: {
    screen: createStackNavigator('Home', Home)
  },
  Tabs: {
    screen: createStackNavigator('ConnectedTabs', ConnectedTabNavigators)
  }
});

// Root App Stack Navigator
// used because some modals are added here.
const AppNavigator = StackNavigator(
  {
    Main: {
      screen: DrawerStack
    }
  },
  {
    headerMode: 'none',
    mode: 'modal'
  }
);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
