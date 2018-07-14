polarity.export = PolarityComponent.extend({
  error: '',
  result: '',
  channels: '',
  tags: '',
  actions: {
    applyTags: function() {
      let self = this;
      let tags = this.get('tags').trim();
      let channels = this.get('channels').trim();

      if (tags.length === 0) {
        this.set('error', 'You must provide at least one tag');
        return;
      }

      if (channels.length === 0) {
        this.set('error', 'You must provide at least one channel ID');
        return;
      }

      let payload = {
        type: 'APPLY_TAGS',
        channels: channels.split(',').map((channel) => channel.trim()),
        tags: tags.split(',').map((tag) => tag.trim()),
        entityValue: this.get('block.entity.value')
      };

      this.sendIntegrationMessage(payload)
        .then(function(response) {
          self.set('result', response);
          self.set('tags', '');
          self.set('channels', '');
          self.set('error', '');
        })
        .catch(function(err) {
          self.set('error', 'ERROR! ' + JSON.stringify(err));
          self.set('result', '');
        });
    }
  }
});
