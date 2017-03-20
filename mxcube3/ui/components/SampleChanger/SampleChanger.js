import React from 'react';
import { Panel, Button, DropdownButton, Glyphicon, } from 'react-bootstrap';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import './SampleChanger.css';
/* eslint-disable react/no-multi-comp */

export class SampleChangerTree extends React.Component {
  render() {
    let titleBackground;

    if (this.props.state === 'READY') {
      titleBackground = 'default';
    } else if (this.props.state === 'MOVING') {
      titleBackground = 'warning';
    } else {
      titleBackground = 'danger';
    }

    return (
      <Panel style={{ marginTop: '0.5em' }} header={this.props.title} bsStyle={titleBackground}>
        {this.props.children}
      </Panel>
    );
  }
}

export class SampleChangerTreeNode extends React.Component {
  constructor(props) {
    super(props);

    this.selectClicked = this.selectClicked.bind(this);
    this.scanClicked = this.selectClicked.bind(this);
    this.refreshClicked = this.refreshClicked.bind(this);
  }

  getUniqueId() {
    if (SampleChangerTreeNode._uid_count === undefined) {
      SampleChangerTreeNode._uid_count = 0;
    }
    return `SCTreeNodeID${SampleChangerTreeNode._uid_count++}`;
  }

  selectClicked() {
    this.props.select(this.props.label);
  }

  scanClicked() {
    this.props.scan(this.props.label);
  }

  refreshClicked() {
    this.props.refresh();
  }

  treeNodeCbxClick(e) {
    const treeNodeIcon = document.getElementById(`${e.target.id}icon`);
    if (treeNodeIcon) {
      if (e.target.checked) {
        treeNodeIcon.className = 'fa fa-minus-square-o';
      } else {
        treeNodeIcon.className = 'fa fa-plus-square-o';
      }
    }
  }

  render() {
    const inputId = this.getUniqueId();

    return (
      <div>
        <li className="treeLi">
          <input type="checkbox"
            className="treeNode"
            id={inputId}
            onClick={this.treeNodeCbxClick}
          />
            <ContextMenuTrigger id={`${this.props.label}`}>
              <label htmlFor={inputId} className="treeNodeLabel">
                <i id={`${inputId}icon`} className="fa fa-plus-square-o" />
                &nbsp;{this.props.label}
              </label>
            </ContextMenuTrigger>
          <ul className="treeUl">
            {this.props.children}
          </ul>
        </li>

        <ContextMenu id={`${this.props.label}`}>
          <li role="heading" className="dropdown-header">
            <b>Container {this.props.label}</b>
          </li>
          <MenuItem divider />
          <MenuItem onClick={this.scanClicked}>
            Scan
          </MenuItem>
          <MenuItem onClick={this.selectClicked}>
            Move to this container
          </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}

export class SampleChangerTreeItem extends React.Component {
  constructor(props) {
    super(props);
    this.itemClicked = this.itemClicked.bind(this);
    this.state = { allow_control: false };
    this.loadSample = this.loadSample.bind(this);
    this.unloadSample = this.unloadSample.bind(this);
  }

  itemClicked() {
    /* eslint-disable react/no-set-state */
    this.setState({ allow_control: !this.state.allow_control });
    /* eslint-enable react/no-set-state */
  }

  loadSample() {
    this.props.load(this.props.label);
  }

  unloadSample() {
    this.props.unload(this.props.label);
  }


  render() {
    const ls = this.props.status === 'Loaded' ? { display: 'inline' } : { display: 'none' };

    return (
      <div>
        <li className="treeLi">
          <div className="sampleLabel">
            <span style={{ verticalAlign: 'middle' }}>
              {this.props.label}
            </span>

            <DropdownButton
              style={{ fontStyle: 'italic', padding: '0.2em 0.2em' }}
              title={`${this.props.dm}`}
              bsStyle="link"
            >
              <li role="heading" className="dropdown-header">
                <b>Position {this.props.label}</b>
              </li>
              <MenuItem divider />
              <MenuItem onClick={this.loadSample}>
                Mount
              </MenuItem>
              <MenuItem onClick={this.unloadSample}>
                Umount to this position
              </MenuItem>
            </DropdownButton>
              <span style={{ verticalAlign: 'middle' }}>
                &nbsp;
                <Glyphicon style={ls} glyph="arrow-left" /> <b style={ls}>(Mounted)</b>
              </span>
          </div>
        </li>
       </div>
    );
  }
}

export default class SampleChanger extends React.Component {
  constructor(props) {
    super(props);
    this.buildTree = this.buildTree.bind(this);
    this.scan = this.scan.bind(this);
  }


  scan() {
    this.props.scan('');
  }


  buildTree(node, root) {
    if (node.children) {
      const childNodes = [];
      for (const c of node.children) {
        childNodes.push(this.buildTree(c));
      }

      return React.createElement(SampleChangerTreeNode,
                                 { label: node.name,
                                   selected: node.selected,
                                   root,
                                   dm: node.id,
                                   select: this.props.select,
                                   status: node.status,
                                   scan: this.props.scan,
                                   refresh: this.props.refresh },
                                 childNodes);
    }

    return React.createElement(SampleChangerTreeItem,
                               { label: node.name,
                                 dm: node.id,
                                 load: this.props.load,
                                 status: node.status,
                                 unload: this.props.unload });
  }

  render() {
    const nodes = this.buildTree(this.props.contents, true);
    return (
      <div style={{ marginTop: '1em' }}>
        <SampleChangerTree
          title={`Sample Changer (${this.props.state})`}
          state={this.props.state}
        >
          <div>
            <Button bsStyle="default" onClick={this.props.refresh}>
               <Glyphicon glyph="refresh" /> Refresh
            </Button>
            <span style={{ marginLeft: '1em' }} />
            <Button bsStyle="default" onClick={this.scan}>
              <Glyphicon glyph="qrcode" /> Scan all containers
            </Button>
            <div style={{ marginBottom: '1em' }} />
            {nodes}
          </div>
        </SampleChangerTree>
      </div>
    );
  }
}

