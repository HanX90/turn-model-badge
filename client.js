/** Client half: a small pill under each completed turn, naming the model(s) that actually served that turn. */
window.__ModuleLoader__.load({
  id: 'dsh-turn-model-badge',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /**
     * Completed-Turn tail entry.
     *
     * Data provenance: the `turn-tail` conversation node derives per-turn token
     * usage from the durable session log, and its `routes` list carries billed
     * provider/model attribution whenever every billed attempt in the turn was
     * attributed. When attribution is missing, this entry renders nothing —
     * never a guessed name.
     */
    function ModelBadge(props) {
      const turn = props && props.turn;
      if (!turn || !turn.data) return null;

      let routes;
      try {
        const tail = turn.data.get('turn-tail');
        routes = tail && tail.tokenUsage && tail.tokenUsage.routes;
      } catch (error) {
        return null;
      }
      if (!Array.isArray(routes) || routes.length === 0) return null;

      const seenPairs = {};
      const pairs = [];
      const models = [];
      for (const route of routes) {
        if (!route || typeof route.model !== 'string' || route.model === '') continue;
        const provider = typeof route.provider === 'string' && route.provider !== '' ? route.provider : null;
        const pair = provider === null ? route.model : provider + '/' + route.model;
        if (seenPairs[pair]) continue;
        seenPairs[pair] = true;
        pairs.push(pair);
        if (models.indexOf(route.model) === -1) models.push(route.model);
      }
      if (models.length === 0) return null;

      return h('span', {
        style: {
          // The turn-tail seat is a stretching flex column, so opt out of the
          // cross-axis stretch and shrink-wrap the text instead of filling the row.
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          width: 'fit-content',
          maxWidth: '100%',
          boxSizing: 'border-box',
          margin: '0 0 0 8px',
          padding: '1px 8px',
          borderRadius: '999px',
          // DeepSeek brand blue with white lettering, legible in both themes.
          backgroundColor: '#4D6BFE',
          color: '#ffffff',
          border: 'none',
          fontSize: '0.78rem',
          fontWeight: 500,
          lineHeight: '18px',
          letterSpacing: '0.01em',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'text',
        },
        title: pairs.join(' · '),
      }, models.join(' · '));
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
          name: 'conversation.chat.turnTail',
          id: 'turn-model-badge',
          order: 30,
        }, ModelBadge));
      },
    };
  },
});
