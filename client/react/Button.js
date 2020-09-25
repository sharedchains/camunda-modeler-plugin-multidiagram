/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */
/* eslint-disable react/prop-types */

import React, { PureComponent } from 'camunda-modeler-plugin-helpers/react';

import classNames from 'classnames';

export default class Button extends PureComponent {

  render() {

    const {
      disabled,
      className,
      ...rest
    } = this.props;

    return (
      <button className={
        classNames({
          disabled
        }, className)
      } { ...rest } />
    );
  }
}