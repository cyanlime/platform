// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import ReactDOM from 'react-dom';
import * as utils from 'utils/utils.jsx';
import * as client from 'utils/client.jsx';
import Constants from 'utils/constants.jsx';

import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

const holders = defineMessages({
    team_error: {
        id: 'sso_signup.team_error',
        defaultMessage: 'Please enter a team name'
    },
    length_error: {
        id: 'sso_signup.length_error',
        defaultMessage: 'Name must be 3 or more characters up to a maximum of 15'
    },
    teamName: {
        id: 'sso_signup.teamName',
        defaultMessage: 'Enter name of new team'
    }
});

import React from 'react';
import {browserHistory} from 'react-router';

class SSOSignUpPage extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.nameChange = this.nameChange.bind(this);

        this.state = {name: ''};
    }
    handleSubmit(e) {
        e.preventDefault();
        const {formatMessage} = this.props.intl;
        var team = {};
        var state = this.state;
        state.nameError = null;
        state.serverError = null;

        team.display_name = this.state.name;

        if (!team.display_name) {
            state.nameError = formatMessage(holders.team_error);
            this.setState(state);
            return;
        }

        if (team.display_name.length <= 2) {
            state.nameError = formatMessage(holders.length_error);
            this.setState(state);
            return;
        }

        team.name = utils.cleanUpUrlable(team.display_name);
        team.type = 'O';

        client.createTeamWithSSO(team,
            this.props.service,
            (data) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                } else {
                    browserHistory.push('/' + team.name + '/channels/town-square');
                }
            },
            (err) => {
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }
    nameChange() {
        this.setState({name: ReactDOM.findDOMNode(this.refs.teamname).value.trim()});
    }
    render() {
        var nameError = null;
        var nameDivClass = 'form-group';
        if (this.state.nameError) {
            nameError = <label className='control-label'>{this.state.nameError}</label>;
            nameDivClass += ' has-error';
        }

        var serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        var disabled = false;
        if (this.state.name.length <= 2) {
            disabled = true;
        }

        var button = null;

        if (this.props.service === Constants.GITLAB_SERVICE) {
            button = (
                <a
                    className='btn btn-custom-login gitlab btn-full'
                    key='gitlab'
                    href='#'
                    onClick={this.handleSubmit}
                    disabled={disabled}
                >
                    <span className='icon'/>
                    <span>
                        <FormattedMessage
                            id='sso_signup.gitlab'
                            defaultMessage='Create team with GitLab Account'
                        />
                    </span>
                </a>
            );
        } else if (this.props.service === Constants.GOOGLE_SERVICE) {
            button = (
                <a
                    className='btn btn-custom-login google btn-full'
                    key='google'
                    href='#'
                    onClick={this.handleSubmit}
                    disabled={disabled}
                >
                    <span className='icon'/>
                    <span>
                        <FormattedMessage
                            id='sso_signup.google'
                            defaultMessage='Create team with Google Apps Account'
                        />
                    </span>
                </a>
            );
        }

        return (
            <form
                role='form'
                onSubmit={this.handleSubmit}
            >
                <div className={nameDivClass}>
                    <input
                        autoFocus={true}
                        type='text'
                        ref='teamname'
                        className='form-control'
                        placeholder={this.props.intl.formatMessage(holders.teamName)}
                        maxLength='128'
                        onChange={this.nameChange}
                        spellCheck='false'
                    />
                    {nameError}
                </div>
                <div className='form-group'>
                    {button}
                    {serverError}
                </div>
            </form>
        );
    }
}

SSOSignUpPage.defaultProps = {
    service: ''
};
SSOSignUpPage.propTypes = {
    intl: intlShape.isRequired,
    service: React.PropTypes.string
};

export default injectIntl(SSOSignUpPage);
