// components/RichText.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Mise en forme légère des descriptions saisies depuis le panneau admin.
//
// Les descriptions sont de simples chaînes dans Firestore : plutôt qu'un
// éditeur riche, on garde du texte lisible tel quel et on interprète quelques
// balises à l'affichage.
//
//   **gras**              *italique*  ou  _italique_
//   [bleu]texte[/bleu]    [rouge]…[/rouge]    [jaune]…[/jaune]    [vert]…[/vert]
//
// Les balises anglaises (blue, red, yellow, green) sont acceptées aussi, et
// tout s'imbrique : [vert]**important**[/vert].
//
// Une balise mal fermée n'est pas interprétée — elle s'affiche telle quelle,
// jamais d'écran cassé ni de texte avalé.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

// Palette volontairement sourde : ces couleurs se posent sur des cartes
// blanches et doivent rester lisibles en paragraphe, pas claquer comme un
// surligneur. Ce sont des tons rabattus, pas les primaires saturées.
export const RICH_COLORS = {
  bleu:  '#2F6FA8',
  rouge: '#B04A45',
  jaune: '#B08415',
  vert:  '#3B7A57',
} as const;

const COLOR_ALIASES: Record<string, keyof typeof RICH_COLORS> = {
  bleu: 'bleu',   blue: 'bleu',
  rouge: 'rouge', red: 'rouge',
  jaune: 'jaune', yellow: 'jaune',
  vert: 'vert',   green: 'vert',
};

const COLOR_NAMES = Object.keys(COLOR_ALIASES).join('|');

// L'ordre compte : **gras** doit être testé avant *italique*, sinon les deux
// astérisques d'ouverture seraient lus comme un italique vide.
const RULES: { re: RegExp; style: (m: RegExpExecArray) => TextStyle; body: (m: RegExpExecArray) => string }[] = [
  {
    re: new RegExp(`\\[(${COLOR_NAMES})\\]([\\s\\S]+?)\\[\\/\\1\\]`, 'i'),
    style: m => ({ color: RICH_COLORS[COLOR_ALIASES[m[1].toLowerCase()]] }),
    body: m => m[2],
  },
  { re: /\*\*([\s\S]+?)\*\*/, style: () => ({ fontWeight: '700' }), body: m => m[1] },
  { re: /\*([\s\S]+?)\*/,     style: () => ({ fontStyle: 'italic' }), body: m => m[1] },
  { re: /_([\s\S]+?)_/,       style: () => ({ fontStyle: 'italic' }), body: m => m[1] },
];

// Renvoie la règle qui s'applique le plus tôt dans la chaîne. À position égale,
// c'est l'ordre de RULES qui tranche — donc le gras avant l'italique.
function firstMatch(text: string) {
  let best: { rule: typeof RULES[number]; m: RegExpExecArray } | null = null;
  for (const rule of RULES) {
    const m = rule.re.exec(text);
    if (m && (!best || m.index < best.m.index)) best = { rule, m };
  }
  return best;
}

function parse(text: string, key = 'r'): React.ReactNode[] {
  const found = firstMatch(text);
  if (!found) return [text];

  const { rule, m } = found;
  const before = text.slice(0, m.index);
  const after = text.slice(m.index + m[0].length);

  return [
    ...(before ? [before] : []),
    <Text key={`${key}-${m.index}`} style={rule.style(m)}>
      {parse(rule.body(m), `${key}-${m.index}`)}
    </Text>,
    ...(after ? parse(after, `${key}a${m.index}`) : []),
  ];
}

// Version sans balises, pour les endroits où l'on ne peut pas styler : partage,
// aperçus tronqués de listes, notifications push.
export function stripRichMarkup(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(new RegExp(`\\[\\/?(?:${COLOR_NAMES})\\]`, 'gi'), '')
    .replace(/\*\*|\*|_/g, '');
}

export function RichText({ children, style }: { children?: string | null; style?: StyleProp<TextStyle> }) {
  if (!children) return null;
  return <Text style={style}>{parse(children)}</Text>;
}
