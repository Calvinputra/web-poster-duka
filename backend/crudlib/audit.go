package crudlib

import "time"

type HistoryFactory[TLive any, THis any] func(live TLive, action string, actor string, changedAt time.Time) THis

type LiveHisNau[TLive any, THis any] struct {
	CreateHistory HistoryFactory[TLive, THis]
}

func (lib LiveHisNau[TLive, THis]) Create(live TLive, actor string) (TLive, THis) {
	action := "create"
	changedAt := time.Now()
	history := lib.CreateHistory(live, action, actor, changedAt)
	return live, history
}
