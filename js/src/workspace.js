(function($) {

  $.Workspace = function(options) {

    jQuery.extend(true, this, {
      type:             null,
      workspaceSlotCls: 'slot',
      focusedSlot:      null,
      slots:            [],
      appendTo:         null,
      parent:           null
    }, options);

    this.element  = this.element || jQuery('<div class="workspace-container" id="workspace">');
    this.init();

  };

  $.Workspace.prototype = {
    init: function () {
      this.element.appendTo(this.appendTo);
      if (this.type === "none") {
        this.parent.toggleSwitchWorkspace();
        return;
      }

      this.calculateLayout();

      this.bindEvents();
    },
    slotList: function(layoutSlots) {
      var _this = this;

      layoutSlots.forEach(function(slotData) {

        if (!jQuery.grep(_this.slots, function(slot) { return slotData.id === slot.slotID; }).length) {
          var appendTo = _this.element.children('div').filter('[data-layout-slot-id="'+slotData.id+'"]')[0];
          _this.slots.push(new $.Slot({
            slotID: slotData.id,
            focused: true,
            parent: _this,
            appendTo: appendTo
          }));
        }
      });
    },

    calculateLayout: function() {
      var _this = this,
      layout;

      _this.layout = layout = new Isfahan({
        containerId: _this.element.attr('id'),
        layoutDescription: _this.parent.workspaces[_this.parent.currentWorkspaceType].layout,
        configuration: null,
        padding: 3 
      });

      var data = layout.filter( function(d) {
        return !d.children;
      });

      // Data Join.
      var divs = d3.select("#" + _this.element.attr('id')).selectAll(".layout-slot")
      .data(data, function(d) { return d.id; });

      // Implicitly updates the existing elements.
      // Must come before the enter function.
      divs.call(cell);

      // Enter
      divs.enter().append("div")
      .attr("class", "layout-slot")
      .attr("data-layout-slot-id", function(d) { return d.id; })
      .call(cell)
      .each(function(d) {
        var appendTo = _this.element.children('div').filter('[data-layout-slot-id="'+ d.id+'"]')[0];
        _this.slots.push(new $.Slot({
          slotID: d.id,
          focused: true,
          parent: _this,
          appendTo: appendTo
        }));
      });

      // Exit
      divs.exit()
      .remove("div")
      .each(function(d) { 
        console.log(_this.slots);
        var slotMap = _this.slots.reduce(function(map, temp_slot) {
            map[d.id] = temp_slot;
            return map;
        }, {}),
        slot = slotMap[d.id];
        if (slot && slot.window) {
          jQuery.publish("windowRemoved", slot.window.id);
        }
        _this.slots.splice(_this.slots.indexOf(slot), 1);
        console.log(_this.slots);
      });

      function cell() {
        this
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx ) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy ) + "px"; });
      }

    },

    split: function(targetSlot, direction) {
      var _this = this,
      node = jQuery.grep(_this.layout, function(node) { return node.id === targetSlot.slotID; })[0];
      console.log(node);
      nodeIndex = node.parent ? node.parent.children.indexOf(node) : node;

      function addSibling(node, beforeOrAfter) {
        newSibling = _this.newNode(node.type, node.address.concat("." + node.type + '1'), node);
        node.parent.children.splice(nodeIndex + 1, 0, newSibling);
        _this.layout.push(newSibling);
      }

      function mutateAndAdd(node, beforeOrAfter) {
        newParent = _this.newNode(node.type, node.address, node.parent),
        oldAddress = node.address;

        // Recalculate the address of this node
        // and flip its type while keeping
        // the same id.
        node.type = node.type === 'row' ? 'column' : 'row';
        node.address = node.address.concat(node.type + '1');

        // Create a new node (which will be childless)
        // that is also a sibling of this node.
        newSibling = _this.newNode(node.type, oldAddress.concat("." + node.type + '1'), newParent);

        // maintain array ordering.
        newParent.children = [];
        newParent.children.push(node, newSibling); // order matters.
        newParent.parent = node.parent;

        // replace the old node in ites parent's child
        // array with the new parent.
        newParent.parent.children[nodeIndex] = newParent;

        node.parent = newParent;
        _this.layout.push(newParent, newSibling);
      }

      if (node.type === 'column') {
        // Since it is a column:
        // 
        // If adding to a side, simply
        // add a sibling.
        // Left means before, right means after.
        if (direction === 'r' || direction === 'l') {
          addSibling(node, direction);
        } 
        // If adding above or below, the
        // operation must be changed to mutating
        // the structure. 
        // Up means before, Down means after.
        else {
          mutateAndAdd(node, direction);
        }
      } else {
        // Since it is a row:
        //
        // If adding to a side, mutate the 
        // structure.
        // Left means before, right means after.
        if (direction === 'r' || direction === 'l') {
          mutateAndAdd(node, direction);
        } 
        // If adding above or below, the
        // operations must be switched to adding
        // a sibling. 
        // Up means before, Down means after.
        else {
          addSibling(node, direction);
        }
      }
      
      // Recalculate the layout.
      // The original hierarchical structure is
      // accessible from the root node. Passing 
      // it back through the layout code will 
      // recalculate everything else needed for 
      // the redraw.
      var root = jQuery.grep(_this.layout, function(node) { return !node.parent;})[0];
      _this.parent.workspaces[_this.parent.currentWorkspaceType].layout = root;
      _this.calculateLayout();

    },

    splitRight: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'r');
    },

    splitDown: function(targetSlot) {
      var _this = this,
      node = jQuery.grep(_this.layout, function(node) { return node.id === targetSlot.slotID; })[0];
      console.log(node);
      nodeIndex = node.parent ? node.parent.children.indexOf(node) : node;

      if (node.type === 'column') {
        // if it's a column, 
        // create a new node that is the parent
        // of this node.
        newParent = _this.newNode(node.type, node.address, node.parent),
        oldAddress = node.address;

        // Recalculate the address of this node
        // and flip its type while keeping
        // the same id.
        node.type = node.type === 'row' ? 'column' : 'row';

        node.address = node.address.concat(node.type + '1');

        // Create a new node (which will be childless)
        // that is also a sibling of this node.
        newSibling = _this.newNode(node.type, oldAddress.concat("." + node.type + '1'), newParent);

        // maintain array ordering.
        newParent.children = [];
        newParent.children.push(node, newSibling);
        newParent.parent = node.parent;

        // replace the old node in ites parent's child
        // array with the new parent.
        newParent.parent.children[nodeIndex] = newParent;

        node.parent = newParent;
        _this.layout.push(newParent);
      } else {
        // if it is a row, simply create a 
        // new sibling and insert it into the 
        // correct location (taking into account
        // the other siblings).
        newSibling = _this.newNode(node.type, node.address.concat("." + node.type + '1'), node);
        node.parent.children.splice(nodeIndex + 1, 0, newSibling);
        _this.layout.push(newSibling);
      }
      
      // Recalculate the layout.
      // The original hierarchical structure is
      // accessible from the root node. Passing 
      // it back through the layout code will 
      // recalculate everything else needed for 
      // the redraw.
      var root = jQuery.grep(_this.layout, function(node) { return !node.parent;})[0];
      _this.parent.workspaces[_this.parent.currentWorkspaceType].layout = root;
      _this.calculateLayout();
    },

    splitUp: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'u');
    },

    splitDwn: function(targetSlot) {
      var _this = this;
      _this.split(targetSlot, 'd');
    },

    newNode: function(type, address, parent) {
      return {
        type: type,
        address: address,
        id: $.genUUID(),
        parent: parent,
      };
    },
    
    availableSlot: function() {
      var toReturn = null;
      jQuery.each(this.slots, function(index, value) {
        if (!value.window) {
          toReturn = value.slotID;
          return false;
        }
      });
      return toReturn;
    },

    bindEvents: function() {
      var _this = this;

      d3.select(window).on('resize', function(event) {
        _this.calculateLayout();
      });
    },

    clearSlot: function(slotId) {
      if (this.slots[slodId].windowElement) { 
        this.slots[slotId].windowElement.remove();
      }
      this.slots[slotId].window = new $.Window();
    },

    addItem: function(slotID) {
      this.focusedSlot = slotID;
      this.parent.toggleLoadWindow();
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 1000, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 1000, easing: "easeInCubic"});
    }
  };

}(Mirador));

